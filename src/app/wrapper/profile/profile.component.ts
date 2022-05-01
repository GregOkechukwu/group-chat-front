import { Component,  OnInit,  ViewChild,  TemplateRef,  OnDestroy } from '@angular/core';
import { FormValidatorService } from 'src/app/services/form-validator.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { UiService } from 'src/app/services/ui.service';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material';
import { CurrentUser } from 'src/app/interfaces';
import { UpdateUserDialogComponent } from 'src/app/dialogs/update-user-dialog/update-user-dialog.component';
import { DataManipulationService } from 'src/app/services/data-manipulation.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector :  'app-profile', 
  templateUrl :  './profile.component.html', 
  styleUrls :  ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  subscriptions : Subscription[] = [];
  
  @ViewChild('updateDefault') updateDefault : TemplateRef<any>;
  @ViewChild('updateProfileForm') updateProfileForm : TemplateRef<any>;
  @ViewChild('updatePicForm') updatePicForm : TemplateRef<any>;

  @ViewChild('usernamePanel') usernamePanel : MatExpansionPanel;
  @ViewChild('firstNamePanel') firstNamePanel : MatExpansionPanel;
  @ViewChild('lastNamePanel') lastNamePanel : MatExpansionPanel;
  @ViewChild('emailPanel') emailPanel : MatExpansionPanel;

  updateDefaultSection : number = 0;
  updateProfileSection : number = 1;
  updatePicSection : number = 2;

  section : number = this.updateDefaultSection;

  form : {
    profileForm : FormGroup
  };

  patternErrLookup : Map<AbstractControl, string>;

  constructor (
    private dataManipulationService : DataManipulationService,
    private formBuilder : FormBuilder,
    private uiService : UiService, 
    private formValidator : FormValidatorService,  
    private userInfoService : UserInfoService,
  ) { }

  ngOnInit() {
    const isRequired = false;

    const basicValidators = this.formValidator.getNameValidators(isRequired);
    const emailValidators = this.formValidator.getEmailValidators(isRequired);
    const usernameValidators = this.formValidator.getUsernameValidators(isRequired);

    const profileForm = this.formBuilder.group({
      username : ['', usernameValidators],
      firstName : ['', basicValidators],
      lastName : ['', basicValidators],
      email : ['', emailValidators]
    });

    this.form = { profileForm };
    this.patternErrLookup = this.buildPatternErrLookup();
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  toSection(section : number) {
    if (this.section === this.updateProfileSection) {
      this.resetForms();
    }

    this.section = section;
  }

  goBack() {
    this.toSection(this.section == this.updatePicSection ? this.updateDefaultSection : this.section - 1);
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

    patternErrLookup.set(this.usernameControl, nameErrMssg);
    patternErrLookup.set(this.firstNameControl, nameErrMssg);
    patternErrLookup.set(this.lastNameControl, nameErrMssg);
    patternErrLookup.set(this.emailControl, emailErrMssg);

    return patternErrLookup;
  }
  
  getErrorMessage(control : AbstractControl) {
    const getPatternErrorMessage = () => this.patternErrLookup.get(control);

    const errMssgLookup = {
      ["minlength"] : "Too Short",
      ["maxlength"] : "Too Long",
      ["emailTaken"] : "Email is not available",
      ["usernameTaken"] : "Username is not available",
      ["pattern"] : getPatternErrorMessage(),
      ["emptyFields"] : ""
    };

    for (const errMssg in errMssgLookup) {
      if (control.hasError(errMssg)) {
        return errMssgLookup[errMssg];
      }
    }

    return "";
  }

  async onSubmit() {
    const controls = this.form.profileForm.controls;

    const isEmpty = str => {
      return str === undefined || str === null || str === "";
    }

    const trimAllFields = () => {
      const trim = this.dataManipulationService.trim;

      for (const controlName in controls) {
        const control = this.getControl(controlName);
        control.setValue(trim(control.value));
      }
    }

    const hasAllEmptyFields = () => {
      let emptyCount = 0;
      const n = Object.keys(controls).length;
      const panels = document.getElementsByClassName("expansion-panel");

      for (const controlName in controls) {
        const control = this.getControl(controlName);
        emptyCount += isEmpty(control.value) ? 1 : 0;   
      }

      this.highlightPanels(panels, emptyCount === n ? 'red' : 'black');
      return emptyCount === n;
    }

    const foundInvalidPanelsToExpand = () => {
      for (const controlName in controls) {
        const control = this.getControl(controlName);

        if (control.status === 'INVALID') {
          this.expandPanel(controlName);
          return true;
        }
      }

      return false;
    }

    const closePanels = () => {
      for (const controlName in controls) {
        this.getPanel(controlName).close();
      }
    }

    const passedFirstCheck = () => {
      return !hasAllEmptyFields() && !foundInvalidPanelsToExpand();
    }

    const passedSecondCheck =  async () => {
      const usernameTaken = await this.userInfoService.checkUsernameNotTakenAsPromise(this.username);
      const emailTaken = await this.userInfoService.checkEmailNotTakenAsPromise(this.email);

      if (usernameTaken || emailTaken) {
        usernameTaken ? this.usernameControl.setErrors({usernameTaken : true}) : null;
        emailTaken ? this.emailControl.setErrors({emailTaken : true}) : null;
      }

      return !foundInvalidPanelsToExpand();
    }
    
    try {
      trimAllFields();
      closePanels();

      if (!passedFirstCheck() || !await passedSecondCheck()) {
        return;
      }

      const heightPx = "295px", widthPx = "600px";

      this.uiService.openDialog(
        heightPx, 
        widthPx,
        "Confirm Update",
        "Please enter your password to confirm update",
        result => {
          if (!result || !result.choseToUpdate) return;
          this.uiService.startLoadingScreen();

          this.updateUser(result.password, (user : CurrentUser) => {
            this.uiService.stopLoadingScreen();

            if (user == undefined) {
              return;
            }
            
            this.userInfoService.profileUpdateNotifier.next(user);
            this.toSection(this.updateDefaultSection);   
            this.uiService.openSnackBar('Updated Profile Successfully');  
          });
        },
        UpdateUserDialogComponent
      );

    } catch (err) {
      foundInvalidPanelsToExpand();
    }

  }

  updateUser(password : string, doSomething : Function) {
    this.disableForms();

    const subscriptionOne = this.userInfoService.updateUser(this.username, this.firstName, this.lastName, this.email, password).subscribe(() => {
      const subscriptionTwo = this.userInfoService.getUser().subscribe((user : CurrentUser) => {
        this.enableForms();
        doSomething(user);

        this.subscriptions.push(subscriptionTwo);
      }, err => doSomething(undefined));
    }, err => doSomething(undefined));

    this.subscriptions.push(subscriptionOne);
  }

  showDescription(controlName : string) {
    const trim = this.dataManipulationService.trim;
    const panel = this.getPanel(controlName);
    const control = this.getControl(controlName);

    return panel && !panel.expanded && trim(control.value) != "" ? control.value : "";
  }

  expandPanel(controlName : string) {
    const panel = this.getPanel(controlName);
    panel.open();
  }

  getPanel(controlName : string) {
    return controlName === 'username' ? this.usernamePanel : controlName === 'email' ? this.emailPanel : controlName === 'firstName' ? this.firstNamePanel : this.lastNamePanel;
  }

  highlightPanels(panels : HTMLCollection, color : string) {
    const n = panels.length;
      
    for (let i = 0; i < n; i++) {
      const panel = <HTMLElement>panels.item(i);
      panel.style.border = `1px solid ${color}`;
    }
  }

  resetBorder() {
    const panels = document.getElementsByClassName("expansion-panel");
    this.highlightPanels(panels, 'black');
  }

  getControl(controlName : string) {
    return this.form.profileForm.controls[controlName];
  }

  get usernameControl() {
    return this.form.profileForm.controls.username;
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

  get username() {
    return this.form.profileForm.controls.username.value;
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

}

