import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { AuthService} from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormValidatorService } from 'src/app/services/form-validator.service';
import { CacheService } from 'src/app/services/cache.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UserInfoService } from 'src/app/services/user-info.service';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  subscriptions : Subscription[] = [];

  @ViewChild('loginForm') loginForm : TemplateRef<any>;
  @ViewChild('verifyForm') verifyForm : TemplateRef<any>;
  @ViewChild('recoverForm') recoverForm : TemplateRef<any>;
  @ViewChild('loginFooter') loginFooter : TemplateRef<any>;
  @ViewChild('rootDiv') rootDiv : ElementRef<HTMLDivElement>;

  loginSection : number = 0;
  verifySection : number = 1;
  recoverSection : number = 2;

  section : number = this.loginSection;
  emailDestination : string;

  showInvalidCredentialsMssg : boolean = false;
  
  sectionNameLookup : Object = {
    [this.loginSection] : "Login", 
    [this.verifySection] : "Verify", 
    [this.recoverSection] : "Recover"
  };

  form : {
    loginForm : FormGroup,
    verifyForm : FormGroup,
    recoverForm : FormGroup
  };

  patternErrLookup : Map<AbstractControl, string>;
    
  constructor(
    private uiService : UiService,
    private formBuilder : FormBuilder, 
    private activatedRoute : ActivatedRoute, 
    private cache : CacheService, 
    private userInfoService : UserInfoService,
    private authService : AuthService, 
    private router : Router, 
    private formValidator : FormValidatorService
  ) { }

  ngOnInit() {
    this.enableForms();
    this.cache.clearCache();

    const subscription = this.activatedRoute.queryParams.subscribe(params => {
      this.section = Object.keys(params).length > 0 ? parseInt(params['section']) : this.section;
    });

    const usernameValidators = this.formValidator.getUsernameValidators();
    const passwordValidators = this.formValidator.getPasswordValidators();

    const loginForm = this.formBuilder.group({
      usernameOrEmail : ['', Validators.required],
      password : ['', Validators.required]
    });

    const verifyForm = this.formBuilder.group({
      username : ['', usernameValidators]
    });

    const recoverForm = this.formBuilder.group({
      verificationCode : ['', Validators.required],
      newPassword : ['', passwordValidators],
      rePassword : ['', Validators.required]
    }, {validator : this.formValidator.passwordMatchValidator});

    this.form = {
      loginForm,
      verifyForm,
      recoverForm
    }

    this.patternErrLookup = this.buildPatternErrLookup();
    this.subscriptions.push(subscription);
  }

  ngAfterViewInit() {
    const subscription = this.uiService.disableElementsNotifier$.subscribe(disableDOMTree => {
      if (disableDOMTree) this.uiService.disableAllElements(this.rootDiv.nativeElement);
      else this.uiService.enableAllElements(this.rootDiv.nativeElement);
    });

    this.subscriptions.push(subscription);
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      if (subscription instanceof Subscription) {
        subscription.unsubscribe();
      }
    }
  }

  getSectionName() {
    return this.sectionNameLookup[this.section];
  }

  goToLogin(hasRecoveredPassword : boolean = false) {
    const navigateToLogin = () => {
      this.section = this.loginSection;
    }

    this.resetForms();
    if (this.section === this.recoverSection && !hasRecoveredPassword) {
      this.exitVerification(() => navigateToLogin());
      return;
    }

    navigateToLogin();
  }

  goToRegister() {
    const navigateToRegister = () => this.router.navigate(['/register']);
    this.resetForms();

    if (this.section === this.recoverSection) {
      this.exitVerification(() => navigateToRegister());
      return;
    }
    
    navigateToRegister();  
  }

  goToForgotPassword() {
    this.router.navigate(['/login']);
    this.section = this.verifySection;
    this.resetForms();
  }

  goToHomePage() {
    this.router.navigate(['/home']); 
  }

  goToNextSection() {
    this.section++;
  }

  onSubmit(formName : string) {

    const validateLoginForm = () =>  {
      this.showInvalidCredentialsMssg = false;
      this.uiService.startLoadingScreen();

      this.loginUser(isAuthenticated => {
        if (isAuthenticated) {
          this.authService.hasLoggedIn = true;
          this.goToHomePage();

        } else {
          this.uiService.stopLoadingScreen();
        }
      });
    }

    const validateVerifyForm = () => {
      this.userInfoService.checkUsernameNotTaken(this.username).subscribe(usernameTaken => {
        if (!usernameTaken) {
          this.usernameControl.setErrors({usernameNotTaken : true});
          return;
        }
        const heightPx = '245px', widthPx = '530px';

        this.uiService.openDialog(
          heightPx,
          widthPx,
          "Confirm",
          `Are you sure you want to send a verification code to the email of this user?`,
          choseToSendCode => { 
            if (!choseToSendCode) return;

            this.uiService.startLoadingScreen();

            this.sendVerificationCode(isSentSuccessfully => {
              if (isSentSuccessfully) {
                this.goToNextSection();
              }

              this.uiService.stopLoadingScreen();
            });
          }
        );

      });
    }

    const validateRecoverForm = () => {
      const heightPx = "245px", widthPx = "500px";

      this.uiService.openDialog(
        heightPx,
        widthPx,
        "Confirm",
        "Are you sure you want to confirm your code and update your password?",
        choseToSendCode => {
          if (!choseToSendCode) return;

          this.uiService.startLoadingScreen();

          this.validateCodeAndUpdatePassword(isUpdatedSuccessfully => {

            if (isUpdatedSuccessfully) {
              const hasRecoveredPassword = true;

              this.resetForms();
              this.goToLogin(hasRecoveredPassword);
              this.uiService.openSnackBar("Updated Password Successfully");
            }

            this.uiService.stopLoadingScreen();

          });
        }
      );
    }
    
    const validateForm = {
      'loginForm' : validateLoginForm,
      'verifyForm' : validateVerifyForm,
      'recoverForm' : validateRecoverForm
    }

    const inputsAreValid = this.form[formName].valid;

    if (!inputsAreValid) {
      return;
    }

    validateForm[formName]();
  }

  loginUser(doSomething : Function) { 
    this.disableForms();

    const subscriptionOne = this.authService.login(this.usernameOrEmail, this.password).subscribe(() => {
      const isOnline = true;
      const subscriptionTwo = this.userInfoService.updateOnlineStatus(isOnline).subscribe(() => {
        doSomething(true);
      });

      this.subscriptions.push(subscriptionOne, subscriptionTwo);

    }, (err : HttpErrorResponse) => {
      this.enableForms();

      if (!err.ok) {
        this.usernameOrEmailControl.setErrors({required : true});
        this.passwordControl.setErrors({required : true});
        this.showInvalidCredentialsMssg = true; 
      }
      doSomething(false);

    });

  }
  
  sendVerificationCode(doSomething : Function) {
    const subscription = this.authService.sendVerificationCode(this.username).subscribe(emailDestination => {
      this.emailDestination = emailDestination;
      doSomething(true);

    }, (err : HttpErrorResponse) => {
      this.usernameControl.setErrors({emailLimitExceeded : true});
      doSomething(false);
    });

    this.subscriptions.push(subscription);
  }

  validateCodeAndUpdatePassword(doSomething : Function) {
    const subscription = this.authService.validateCodeAndUpdatePassword(this.username, this.verificationCode, this.newPassword).subscribe(() => {
      doSomething(true);
    }, (err : HttpErrorResponse) => { 
      !err.ok ? this.verificationCodeControl.setErrors({invalidCode : true}) : null;
      doSomething(false);
    });

    this.subscriptions.push(subscription);
  }
  
  exitVerification(navigateToPage : Function) {
    const heightPx = "225px", widthPx = "500px";

    this.uiService.openDialog(
      heightPx,
      widthPx,
      "Exit",
      "Are you sure you want to exit your verification?",
      choseToExit => {
        if (!choseToExit) return;
        this.resetForms();
        navigateToPage();
      }
    ); 
  }

  resetForms() {
    for (const formName in this.form) {
      this.form[formName].reset();
    }
    this.showInvalidCredentialsMssg = false;
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
    const passwordErrMssg = "Too Weak";

    patternErrLookup.set(this.usernameControl, nameErrMssg);
    patternErrLookup.set(this.newPasswordControl, passwordErrMssg);

    return patternErrLookup;
  } 
  
  getErrorMessage(formControl : FormControl) {
    const getPatternErrorMessage = () => this.patternErrLookup.get(formControl);
    let errMssg = "";

    if (formControl.hasError("minlength"))        errMssg = "Too Short";
    if (formControl.hasError("maxlength"))        errMssg = "Too Long";
    if (formControl.hasError("mismatch"))         errMssg = "Password does not match";
    if (formControl.hasError("pattern"))          errMssg = getPatternErrorMessage();
    if (formControl.hasError("invalidCode"))      errMssg = "Invalid Code";
    if (formControl.hasError("usernameNotTaken")) errMssg = "Username does not exist";
    if (formControl.hasError("emailLimitExceeded"))    errMssg = "Email limit exceeded";

    return errMssg;
  }

  onKeyPress() {
    this.usernameOrEmailControl.setErrors({required : null});
    this.passwordControl.setErrors({required : null});
    this.usernameOrEmailControl.updateValueAndValidity();
    this.passwordControl.updateValueAndValidity();
  }

  getGrayOutCSSClass() {
    const showingProgressBar = this.uiService.showProgressBar;

    return {
      'gray-out' : showingProgressBar ? true : false
    }
  }

  get usernameOrEmailControl() {
    return this.form.loginForm.controls.usernameOrEmail;
  }

  get passwordControl() {
    return this.form.loginForm.controls.password;
  }

  get usernameControl() {
    return this.form.verifyForm.controls.username;
  }

  get verificationCodeControl() {
    return this.form.recoverForm.controls.verificationCode;
  }

  get newPasswordControl() {
    return this.form.recoverForm.controls.newPassword;
  }

  get rePasswordControl() {
    return this.form.recoverForm.controls.rePassword;
  }

  get usernameOrEmail() {
    return this.form.loginForm.controls.usernameOrEmail.value;
  }

  get password() {
    return this.form.loginForm.controls.password.value;
  }

  get username() {
    return this.form.verifyForm.controls.username.value;
  }

  get verificationCode() {
    return this.form.recoverForm.controls.verificationCode.value;
  }

  get newPassword() {
    return this.form.recoverForm.controls.newPassword.value;
  }

  get rePassword() {
    return this.form.recoverForm.controls.rePassword.value;
  }

}
