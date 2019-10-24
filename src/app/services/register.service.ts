import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { AmazonCognitoIdentity ,  AuthService } from './auth.service';
import { Router } from '@angular/router';

interface UserInfo {
  firstname : string
  lastname : string
  email : string
  username? : string
  password? : string
  date_created? : Date
}

@Injectable({
  providedIn :  'root'
})
export class RegisterService {
  payload : Object;
  constructor(private http : HttpClient, private authService : AuthService, private router : Router) {}

  registerUser(payload : UserInfo, callback){
    let dataName = {
      Name : 'name',  
      Value : `${payload.firstname} ${payload.lastname}`
    }

    let dataEmail = {
      Name : 'email', 
      Value : payload.email
    }

    let attributeName = new AmazonCognitoIdentity.CognitoUserAttribute(dataName);
    let attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    let attributeList = [attributeName, attributeEmail]

    this.authService.userPool.signUp(
      payload.username,  
      payload.password,  
      attributeList, 
      null, 
      (err, result) => { // send confirmation code to user's email via Amazon SES if successfull`
        callback(err, result)
        if (result) {
          payload.date_created = new Date();
          this.payload = payload;
        }
      });
  }

  resendConfirmationCode(username, callback) {
    let cognitoUser = this.authService.getCognitoUser(username, this.authService.userPool);
    cognitoUser.resendConfirmationCode((err, result) => callback(err, result))
  }

  confirmRegistration(code, username, callback){
    let cognitoUser = this.authService.getCognitoUser(username,  this.authService.userPool);

    cognitoUser.confirmRegistration(code, true,  (err, result) => {
      if (result && this.payload) {
        this.postNewUser(this.payload, callback); // log user in as soon as they confirm registration

      } else if (err) callback(err, null);  
      
    });
  }

  postNewUser(payload, callback) {
    let username = payload.username, password = payload.password
    payload = {firstname : payload.firstname, lastname : payload.lastname,  date_created : payload.date_created,  email : payload.email}
    
    this.authService.firstLogin(username, password, payload, err => {
      if (err) callback(err)
      else this.router.navigate(['/home']);
    });
  }
}


