import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, ViewChildren, QueryList, OnDestroy, ElementRef } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { Observable, timer, Subscription } from 'rxjs';
import { FormValidatorService } from 'src/app/services/form-validator.service';
import { UserInfoService } from 'src/app/services/user-info.service';

@Component( {
  selector :  'app-register',
  templateUrl :  './register.component.html',
  styleUrls :  ['./register.component.css']
})
export class RegisterComponent implements OnInit, AfterViewInit, OnDestroy {

  private timer : Observable<number>;
  private subscription : Subscription;

  @ViewChild("userInfo") info : TemplateRef<any>;
  @ViewChild("userCredentials") credentials : TemplateRef<any>;
  @ViewChild("userConfirmation") confirmation : TemplateRef<any>
  @ViewChildren("i") inputsInfo : QueryList<ElementRef>
  @ViewChildren("j") inputsCred : QueryList<ElementRef>
  @ViewChild("k") inputCode : ElementRef

  section : number  =  0;

  firstname : string;
  lastname : string;
  email : string;
  username : string;
  password : string;
  rePassword : string;
  confirmationCode : string;
  errMssg : string;

  passwordMatch = true;
  emptyFields = false;
  registrationErr = false;
  validEmail  = true;
  validCode = true;
  sendCodeAgain = false;
  validUsername = true;

  constructor(private registerService : RegisterService, private formValidator : FormValidatorService, private userInfoService : UserInfoService)  { }

  ngOnInit()  {
    localStorage.clear();
    this.timer =  timer(3000);
  } 

  ngAfterViewInit() {}

  ngOnDestroy() {
    if ((this.subscription instanceof Subscription)) this.subscription.unsubscribe();
  }
  disableFlag(S) {
    this.subscription = this.timer.subscribe(num => {
       if (S  ===  'emptyFields') this.emptyFields =  false;
       if (S  === 'validCode') this.validCode = false;
       if (S  ===  'passwordMatch') this.passwordMatch = true;
       if (S  ===  'registrationErr') this.registrationErr = false;
       if (S  ===  'validEmail') this.validEmail = true;
       if (S  ===  'sendCodeAgain') this.sendCodeAgain = false;
       if (S ===  'validUsername') this.validUsername = true;
   });
  }

  fieldIsEmpty(S) {
     if (S) {
      this.errMssg = S
      this.emptyFields =  true;
      this.disableFlag('emptyFields');
    }
  }
  
  nextForm(queryList, page : string) { 
    let emptyInputs  =  this.formValidator.checkForEmptyInputs(queryList)
    if (emptyInputs.emptyFields) {
      this.fieldIsEmpty(emptyInputs.errStr)
      return;
    }
    if (page === 'inputsInfo' && this.checkEmailStr(this.email)) {
      this.checkEmailAvailablility(isAvailable => {
        console.log(isAvailable)
        if (isAvailable) {
          this.section++; 
          this.emptyFields = false; 
        }
      });

    } else if (page === 'inputsCredGoingBack') {
      this.passwordMatch = true; 
      this.emptyFields = false;
      this.registrationErr = false;
      this.section--;
    } else if (page === 'inputsCredRegister' && this.strLengthIsValid(this.username)) {
      this.register((success : boolean) => this.section += success ? 1 : 0);
    }
  }

  checkEmailAvailablility(callback) {
    this.userInfoService.checkAvailability('email', this.email).subscribe(isAvailable => {
      if (!isAvailable) {
        this.errMssg = "Email is not available";
        this.validEmail = false;
        this.disableFlag('validEmail'); 
      }
      callback(isAvailable)
    });
  }

  checkEmailStr(str) {
    let flag  = true;
    if (!this.formValidator.checkEmailStr(str)) {
      flag = false;
      this.errMssg = "Invalid Email";
      this.validEmail  =  false;
      this.disableFlag('validEmail');
    } else {
      this.validEmail = true;
    }
    return flag;
  }

  strLengthIsValid(str) {
    if (!this.formValidator.strLengthIsValid(str)) {
     this.errMssg = "Username is too short";
     this.validUsername = false;
     this.disableFlag('validUsername');
     return false
    }
    return true;
  }

  checkForPasswordMatch() {
    if (this.formValidator.checkForPasswordMatch(this.password, this.rePassword)) {
      this.passwordMatch = true; 
      return true;
    } else {
      this.errMssg = "Password Does Not Match";
      this.passwordMatch = false;
      this.password = '';
      this.rePassword = '';
      this.disableFlag('passwordMatch');
      return false;
    }
  }

  checkPasswordField(S) {
     if (!S) this.rePassword = '';
    return S ? true : false;
  }

  register(callback) {
     if (this.checkForPasswordMatch()) {
      this.registerService.registerUser(      
      {
        firstname : this.firstname,
        lastname : this.lastname,
        email : this.email,
        username : this.username,
        password : this.password,
      },
      (err, result) => {
        let flag  = false; // lets us know if user registered successfully.
        if (err) {
          this.registrationErr = true;
          if (err.code === 'InvalidParameterException' || err.code === 'InvalidPasswordException') {
            this.errMssg = "Weak Password"
          }
          else if (err.code ===  'UsernameExistsException') {
            this.errMssg = "Username not available"
          }
          this.disableFlag('registrationErr');
          callback(flag);
        } else {
          flag = true;
          this.registrationErr = false;
          callback(flag); // go to confirmation page.
        }
      });
    }
  }

  resendCode() {
    this.registerService.resendConfirmationCode(this.username, (err, result) => {
      if (err) {
        console.log(err);
        this.errMssg = "error occurred when resending";
        this.validCode = false;
        this.disableFlag('validCode');
      } else this.sendCodeAgain = true;
    });
  }

  confirmCode(input : ElementRef) {
    let emptyInputs = this.formValidator.checkForEmptyInputs(null, input)
     if (emptyInputs.emptyFields) {
      this.fieldIsEmpty(emptyInputs.errStr)
      return;
    }    
    this.registerService.confirmRegistration(this.confirmationCode, this.username, (err, result) => {
      if (err) {
        console.log(err);
        this.errMssg = "Invalid Verification Code";
        this.validCode = false;
        this.disableFlag('validCode');
      }
    });
  }
}


