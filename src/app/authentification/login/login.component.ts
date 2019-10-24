import { Component, OnInit, ViewChildren, QueryList, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { timer, Subscription, Observable} from 'rxjs';
import { AuthService} from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { FormValidatorService } from 'src/app/services/form-validator.service';
import { CacheService } from 'src/app/services/cache.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private timer : Observable<number>;
  private subscription : Subscription;

  @ViewChild('userLogin') userLogin : TemplateRef<any>;
  @ViewChild('userVerifyUsername') userVerifyUsername : TemplateRef<any>;
  @ViewChild('userRecover') userRecover : TemplateRef<any>;

  @ViewChildren('i') inputsCred : QueryList<ElementRef>; 
  @ViewChild('j') inputUsername : ElementRef;
  @ViewChildren('k') inputCodeNPass : ElementRef;

  section = 0;
  justChangedPassword = false;

  validCredentials = true;
  validUser = true;
  emptyFields = false;
  validCode = true;
  passwordMatch = true;
  weakPassword = false;

  successMssg : string;
  errMssg : string;

  usernameOrEmail : string;
  password : string;

  verificationUsername : string
  verificationCode : string;
  newPassword : string
  reNewPassword : string
    
  constructor(private cache : CacheService, private authService : AuthService, private router : Router, private formValidator : FormValidatorService) { }

  ngOnInit() {
    this.cache.clearImageCache()
    this.timer = timer(3000); //again remember it calls complete() after each emit
  }

  ngOnDestroy() {
    if ((this.subscription instanceof Subscription)) this.subscription.unsubscribe();
  }

  disableFlag(S) {
    this.subscription=this.timer.subscribe(num => {
      if(S === 'emptyFields') this.emptyFields = false;
      if(S === 'validUser') this.validUser = true;
      if(S === 'validCode') this.validCode = true;
      if(S === 'justChangedPassword') this.justChangedPassword = false
      if(S === 'validCredentials') this.validCredentials = true
      if(S === 'passwordMatch') this.passwordMatch = true
      if(S === 'weakPassword') this.weakPassword = false
   });
  }

  fieldIsEmpty(S) {
    if (S) {
      this.errMssg = S;
      this.emptyFields = true;
      this.disableFlag('emptyFields');
    }
  }

  nextForm(queryList, page : string, elem?) {
    let emptyInputs;
    if (elem) emptyInputs = this.formValidator.checkForEmptyInputs(null, elem);
    else emptyInputs = this.formValidator.checkForEmptyInputs(queryList);

    if (emptyInputs.emptyFields) {
      this.fieldIsEmpty(emptyInputs.errStr)
      return;
    }

    if (page === 'back') {
      this.emptyFields = false;
      this.validUser = true;
      this.validCode = true;
      this.section--;  

    } else if (page === 'inputUsername') {
      this.authService.forgotPassword(this.verificationUsername, (err, result) => {
        if (err) { 
          if (err.code ==="LimitExceededException") {
            this.errMssg = "Limit Exceeded. Try again later."
          } else {
            this.errMssg = "Invalid Username";
          }
          this.validUser = false
          this.disableFlag('validUser');
          this.verificationUsername = '';
        } else {
          // sends verification email to user
          this.section++;
        }
      });
    } else if (page === 'inputCodeNPass' && this.checkForPasswordMatch()) {
      this.authService.confirmPassword(this.verificationUsername, this.verificationCode, this.newPassword, 
        (err, result) => {
          if (err) {
            if (err.code === 'CodeMismatchException'){
              this.errMssg = "Invalid Verification Code"
            } else {
              this.errMssg = "Weak Password"
            } 
            this.weakPassword = true;
            this.disableFlag('weakPassword');
          } else {
            this.justChangedPassword = true;
            this.successMssg = "Your Password has been Changed";
            this.disableFlag('justChangedPassword');
            this.section = 0;
          }
        });
    }
  }


  login(queryList) {
    let emptyInputs = this.formValidator.checkForEmptyInputs(queryList)
    if (emptyInputs.emptyFields) {
      this.fieldIsEmpty(emptyInputs.errStr);
      return;
    }
    this.authService.loginUser(this.usernameOrEmail, this.password, (err, result) => {
      if (err) {
        this.errMssg = "Invalid Credentials"
        this.validCredentials = false;
        this.disableFlag('validCredentials');

        this.password = '';
      } else this.router.navigate(['/home']);

    });
  }

  checkForPasswordMatch() {
    if (this.formValidator.checkForPasswordMatch(this.newPassword, this.reNewPassword)) {
      this.passwordMatch = true; 
      return true;
    } else {
      this.errMssg = "Password Does Not Match";
      this.passwordMatch = false;
      this.disableFlag('passwordMatch');
      return false;
    }
  }
  checkPasswordField(str) {
    if (!str) this.reNewPassword = '';
    return str ? true : false;
  }

}
