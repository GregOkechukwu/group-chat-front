import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { FormValidatorService } from 'src/app/services/form-validator.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { AbstractControl, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, Observable, timer } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UiService } from 'src/app/services/ui.service';
import { RegisterUserInfo } from 'src/app/interfaces';

@Component( {
  selector :  'app-register',
  templateUrl :  './register.component.html',
  styleUrls :  ['./register.component.css']
})
export class RegisterComponent implements OnInit, AfterViewInit, OnDestroy {

  delayTimer : Observable<number> = timer(800);
  subscriptions : Subscription[] = [];

  @ViewChild("userInfoForm") userInfoForm : TemplateRef<any>;
  @ViewChild("passwordInfoForm") passwordInfoForm : TemplateRef<any>;
  @ViewChild("registerFooter") registerFooter : TemplateRef<any>;
  @ViewChild("rootDiv") rootDiv : ElementRef<HTMLDivElement>;

  userInfoSection : number = 0;
  passwordInfoSection : number = 1;
  section : number = this.userInfoSection;

  form : {
    profileForm : FormGroup, 
    passwordForm : FormGroup
  };

  patternErrLookup : Map<AbstractControl, string>;
  dateCreated : string;

  constructor(
    private uiService : UiService,
    private router : Router, 
    private formBuilder : FormBuilder, 
    private registerService : RegisterService, 
    private formValidator : FormValidatorService, 
    private userInfoService : UserInfoService,
    private authService : AuthService
  ) { }

  ngOnInit() {

    const basicValidators = this.formValidator.getNameValidators();
    const emailValidators = this.formValidator.getEmailValidators();
    const usernameValidators = this.formValidator.getUsernameValidators();
    const passwordValidators = this.formValidator.getPasswordValidators();

    const profileForm = this.formBuilder.group({
      username : ['', usernameValidators],
      firstName : ['', basicValidators],
      lastName : ['', basicValidators],
      email : ['', emailValidators]
    });

    const passwordForm = this.formBuilder.group({
      tempPassword : ['', Validators.required],
      newPassword : ['', passwordValidators],
      rePassword : ['', Validators.required]
    }, {validator : this.formValidator.passwordMatchValidator});

    this.form = {
      profileForm,
      passwordForm 
    }

    this.patternErrLookup = this.buildPatternErrLookup();
  }

  ngAfterViewInit() {
    const subscription = this.uiService.disableElementsNotifier$.subscribe(disableDOMTree => {
      if (disableDOMTree) this.uiService.disableAllElements(this.rootDiv.nativeElement);
      else this.uiService.enableAllElements(this.rootDiv.nativeElement);
    });

    this.subscriptions.push(subscription);
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  goToLogin() {
    const navigateToLogin = () => {
      const userLoginSection = 0;
      this.router.navigate(['/login'], {queryParams : {section : userLoginSection}});
    }

    if (this.section == this.passwordInfoSection) {
      this.exitRegistration(() => {
        navigateToLogin();
      })
      return;
    }

    navigateToLogin();
  }

  goToForgotPassword() {
    const navigateToForgotPassword = () => {
      const forgotPasswordSection = 1;
      this.router.navigate(['/login'], {queryParams : {section : forgotPasswordSection}});
    }

    if (this.section == this.passwordInfoSection) {
      this.exitRegistration(() => {
        navigateToForgotPassword();
      })
      return;
    }

    navigateToForgotPassword();
  }

  goToHomePage() { 
    this.router.navigate(['/home']); 
  }

  toSection(section : number) {
    this.section = section;
  }

  onSubmit(formName : string) {

    const validateProfileForm = () => {
      const subscription = this.userInfoService.checkUsernameAndEmailNotTaken(this.username, this.email).subscribe(data => {
        const {usernameTaken, emailTaken} = data;

        if (usernameTaken || emailTaken) {
          usernameTaken ? this.usernameControl.setErrors({usernameTaken : true}) : null;
          emailTaken ? this.emailControl.setErrors({emailTaken : true}) : null;
          return;
        }

        const heightPx = "225px", widthPx = "500px";

        this.uiService.openDialog(
          heightPx,
          widthPx,
          "Confirm",
          "Are you sure you want to confirm your User Info?",
          choseToConfirmUserInfo => {
            if (!choseToConfirmUserInfo) return;

            this.uiService.startLoadingScreen();

            this.initiateRegistration(() => {
              this.toSection(this.section + 1);
              this.uiService.stopLoadingScreen();
            });
          }
        );

      });

      this.subscriptions.push(subscription);
    }

    const validatePasswordForm = () => {
      
      this.confirmRegistration(isAuthenticated => {

        if (!isAuthenticated) {
          this.uiService.stopLoadingScreen();
          return;
        }

        this.saveUserInfo(() => {
          const isOnline = true;
          this.userInfoService.updateOnlineStatus(isOnline).subscribe(() => {
            this.enableForms();
            this.goToHomePage();
          });
        });

      });
    }

    if (!this.form[formName].valid) {
      return;
    }

    const validateForm = {
      'profileForm' : validateProfileForm,
      'passwordForm' : validatePasswordForm
    }

    validateForm[formName]();
  }

  saveUserInfo(doSomething : Function) {
    const subscription = this.userInfoService.saveUser(this.username, this.firstName, this.lastName, this.email, this.dateCreated).subscribe(() => doSomething());
      this.subscriptions.push(subscription);
  }

  exitRegistration(navigateToPage : Function) {
    const heightPx = "225px", widthPx = "500px";

    this.uiService.openDialog(
      heightPx,
      widthPx,
      "Exit",
      "Are you sure you want to exit your registration?",
      choseToExit => {
        if (!choseToExit) return;
        
        this.uiService.showProgressBar = true;
        this.cancelRegistration(() => {
          this.resetForms();
          navigateToPage();
          this.uiService.showProgressBar = false;
        });
      }
    );
  }

  restartRegistration() {
    const heightPx = "225px", widthPx = "500px";

    this.uiService.openDialog(
      heightPx,
      widthPx,
      "Restart",
      "Are you sure you want to start over?",
      choseToRestart => {
        if (!choseToRestart) return;

        this.uiService.startLoadingScreen();

        this.cancelRegistration(() => {
          this.resetForms();
          this.toSection(this.userInfoSection);
          this.uiService.stopLoadingScreen();

        });
      }
    );
  }
  
  confirmRegistration(doSomething : Function) {
    const heightPx = "225px", widthPx = "500px";

    this.uiService.openDialog(
      heightPx,
      widthPx,  
      "Confirm",
      "Are you sure you want to confirm your registration?",
      choseToConfirm => {
        if (!choseToConfirm) return;

        this.disableForms();
        this.uiService.startLoadingScreen();

        const subscription = this.authService.firstLogin(this.username, this.newPassword, this.tempPassword).subscribe(() => doSomething(true), (err : HttpErrorResponse) => {
          this.enableForms();
          !err.ok ? this.tempPasswordControl.setErrors({invalidPassword : true}) : null;
          doSomething(false);
        });

        this.subscriptions.push(subscription);
      }
    );
  }

  initiateRegistration(doSomething : Function) {
    this.disableForms();

    const subscription = this.registerService.initiateRegistration(
      this.username,
      this.email,
      this.firstName,
      this.lastName
    ).subscribe((data : RegisterUserInfo) => {
      const {username, email, firstName, lastName, dateCreated} = data;

      this.usernameControl.setValue(username);
      this.emailControl.setValue(email);
      this.firstNameControl.setValue(firstName);
      this.lastNameControl.setValue(lastName);
      this.dateCreated = dateCreated;

      this.delayTimerHandler(() => {
        doSomething();
        this.enableForms();
      });
    });

    this.subscriptions.push(subscription);
  }

  cancelRegistration(doSomething : Function) {
    const subscription = this.registerService.cancelRegistration(this.username).subscribe(() => doSomething());
    this.subscriptions.push(subscription);
  }

  resetForms() {
    for (const formName in this.form) {
      this.form[formName].reset();
    }
  }

  disableForms() {
    for (const formName in this.form) {
      this.form[formName].disable();
    }
  }

  enableForms() {
    for (const formName in this.form) {
      this.form[formName].enable();
    }
  }

  buildPatternErrLookup() {
    const patternErrLookup = new Map<AbstractControl, string>();

    const nameErrMssg = "Invalid Characters";
    const emailErrMssg = "Invalid Email";
    const passwordErrMssg = "Too Weak";

    patternErrLookup.set(this.usernameControl, nameErrMssg);
    patternErrLookup.set(this.firstNameControl, nameErrMssg);
    patternErrLookup.set(this.lastNameControl, nameErrMssg);
    patternErrLookup.set(this.emailControl, emailErrMssg);
    patternErrLookup.set(this.newPasswordControl, passwordErrMssg);

    return patternErrLookup;
  }     
  
  getErrorMessage(formControl : FormControl) {
    const getPatternErrorMessage = () => this.patternErrLookup.get(formControl);

    let errMssg = "";

    if (formControl.hasError("minlength"))        errMssg = "Too Short";
    if (formControl.hasError("maxlength"))        errMssg = "Too Long";
    if (formControl.hasError("mismatch"))         errMssg = "Password does not match";
    if (formControl.hasError("emailTaken"))       errMssg = "Email is not available";
    if (formControl.hasError("usernameTaken"))    errMssg = "Username is not available";
    if (formControl.hasError("pattern"))          errMssg = getPatternErrorMessage();
    if (formControl.hasError("invalidPassword"))  errMssg = "Invalid Password";

    return errMssg;
  }

  delayTimerHandler(doSomething : Function) {
    const subscription = this.delayTimer.subscribe(num => {
      doSomething();
    });

    this.subscriptions.push(subscription);
  }

  getGrayOutCSSClass() {
    const showingProgressBar = this.uiService.showProgressBar;

    return {
      'gray-out' : showingProgressBar ? true : false
    }
  }

  get firstNameControl() {
    return this.form.profileForm.controls.firstName;
  }

  get lastNameControl() {
    return this.form.profileForm.controls.lastName;
  }

  get emailControl() {
    return this.form.profileForm.controls.email;
  }

  get usernameControl() {
    return this.form.profileForm.controls.username;
  }

  get tempPasswordControl() {
    return this.form.passwordForm.controls.tempPassword;
  }
 
  get newPasswordControl() {
    return this.form.passwordForm.controls.newPassword;
  }

  get rePasswordControl() {
    return this.form.passwordForm.controls.rePassword;
  }

  get firstName() {
    return this.form.profileForm.controls.firstName.value;
  }

  get lastName() {
    return this.form.profileForm.controls.lastName.value;
  }

  get email() {
    return this.form.profileForm.controls.email.value;
  }

  get username() {
    return this.form.profileForm.controls.username.value;
  }

  get tempPassword() {
    return this.form.passwordForm.controls.tempPassword.value;  
  }
 
  get newPassword() {
    return this.form.passwordForm.controls.newPassword.value;
  }

  get rePassword() {
    return this.form.passwordForm.controls.rePassword.value;
  }

}




