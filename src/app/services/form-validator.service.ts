import { Injectable} from '@angular/core';
import { Validators, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn :  'root'
})
export class FormValidatorService {

  constructor() { }

  private getUsernameRegex() {
    return /^[a-zA-Z0-9äöüÄÖÜ]*$/;
  }
  
  private getNameRegex() {
    return /^[A-Za-z]+$/;
  }

  private getEmailRegex() {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  }

  private getPasswordRegex() {
    return /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/;
  }

  getNameValidators(isRequired : boolean = true, withLengthRequirements : boolean = true) {
    const nameRegex = this.getNameRegex();
    const validations = [Validators.pattern(nameRegex)];

    if (isRequired) {
      validations.push(Validators.required);
    }

    if (withLengthRequirements) {
      validations.push(Validators.minLength(1), Validators.maxLength(30));
    }

    return Validators.compose(validations);
  }

  getEmailValidators(isRequired : boolean = true) {
    const emailRegex = this.getEmailRegex();
    const validations = [Validators.pattern(emailRegex)];

    if (isRequired) {
      validations.push(Validators.required);
    }
    
    return Validators.compose(validations);
  }

  getUsernameValidators(isRequired : boolean = true, withLengthRequirements : boolean = true) {
    const usernameRegex = this.getUsernameRegex();
    const validations = [Validators.pattern(usernameRegex)];

    if (isRequired) {
      validations.push(Validators.required);
    }

    if (withLengthRequirements) {
      validations.push(Validators.minLength(3), Validators.maxLength(20));
    }

    return Validators.compose(validations);
  }

  getPasswordValidators(isRequired : boolean = true, withLengthRequirements : boolean = true) {
    const passwordRegex = this.getPasswordRegex();
    const validations = [Validators.pattern(passwordRegex)];
   
    if (isRequired) {
      validations.push(Validators.required);
    }

    if (withLengthRequirements) {
      validations.push(Validators.minLength(8), Validators.maxLength(20));
    }

    return Validators.compose(validations);
  }
  
  passwordMatchValidator(control : AbstractControl) {
    const newPasswordControl = control.get('newPassword');
    const rePasswordControl = control.get('rePassword');

    const newPassword = newPasswordControl.value;
    const rePassword = rePasswordControl.value;

    if (newPassword !== undefined && newPassword !== rePassword) {
      rePasswordControl.setErrors({mismatch : true});
    }
  }


}


