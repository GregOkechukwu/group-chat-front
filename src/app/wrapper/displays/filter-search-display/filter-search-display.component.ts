import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';
import { FormValidatorService } from 'src/app/services/form-validator.service';
import { Observable, Subscription } from 'rxjs';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-filter-search-display',
  templateUrl: './filter-search-display.component.html',
  styleUrls: ['./filter-search-display.component.css']
})
export class FilterSearchDisplayComponent implements OnInit, OnDestroy {

  subscriptions : Subscription[] = [];

  @Input() title : string;
  @Input() placeholder : string;
  @Input() lastFilter : string;
  @Input() resetFilterNotifier$ : Observable<void>;

  @Output() searchUsers : EventEmitter<{username : string, firstName : string, lastName : string}> = new EventEmitter<{username : string, firstName : string, lastName : string}>();

  form : {
    searchUserForm : FormGroup
  };

  filters : string[] = [
    "Search By Username",
    "Search By First Name",
    "Search By Last Name"
  ];

  currFilterIdx : number = 0;

  constructor(
    private formValidator : FormValidatorService, 
    private formBuilder : FormBuilder,
    private uiService : UiService
  ) { }

  ngOnInit() {
    const isRequired = true;
    const withLengthRequirements = false;

    const usernameValidators = this.formValidator.getUsernameValidators(isRequired, withLengthRequirements);

    const searchUserForm = this.formBuilder.group({
      userAttribute : ['', usernameValidators]
    });

    const subscription = this.resetFilterNotifier$.subscribe(() => {
      this.resetFilter(this.userAttributeControl);
    });

    this.form = { searchUserForm };

    this.filters.push(this.lastFilter);
    this.subscriptions.push(subscription);
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  onSearch() {
    if (this.userAttributeControl.invalid) {
      return;
    }

    this.searchUsers.emit({
      username : this.currFilterIdx == 0 ? this.userAttribute : "",
      firstName : this.currFilterIdx == 1 ? this.userAttribute : "",
      lastName : this.currFilterIdx == 2 ? this.userAttribute : ""
    });
  }

  updateFilter(control : AbstractControl) {
    const isRequired = true;
    const withLengthRequirements = false;

    const n = this.filters.length;
    const basicValidators = this.formValidator.getNameValidators(isRequired);
    const usernameValidators = this.formValidator.getUsernameValidators(isRequired, withLengthRequirements);

    const goToNextFilter = () => {
      this.currFilterIdx += this.currFilterIdx === n - 1 ? -(n - 1) : 1; 
    }
    
    const enableOrDisableControl = () => {
      this.currFilterIdx === n - 1 ? control.disable() : control.disabled ? control.enable() : null;
    }

    const addValidators = () => {
      control.clearValidators();
      this.currFilterIdx === 0 ? control.setValidators(usernameValidators) :
      this.currFilterIdx === 1 || this.currFilterIdx === 2 ? control.setValidators(basicValidators) : control.clearValidators();
      control.updateValueAndValidity();
    }

    goToNextFilter();
    enableOrDisableControl();
    addValidators();
  }

  resetFilter(control : AbstractControl) {
    if (control.disabled) {
      control.enable();
    }

    const isRequired = true;
    const withLengthRequirements = false;
    const usernameValidators = this.formValidator.getUsernameValidators(isRequired, withLengthRequirements);

    this.currFilterIdx = 0;
    control.clearValidators();
    control.setValidators(usernameValidators);
  }

  getErrorMessage(control : AbstractControl) {
    let errMssg = "";
    if (control.hasError("required"))   errMssg = "Required";

    return errMssg;
  }

  get currentFilter() {
    return this.filters[this.currFilterIdx];
  }

  get userAttributeControl() {
    return this.form.searchUserForm.controls.userAttribute;
  }

  get userAttribute() {
    return this.form.searchUserForm.controls.userAttribute.value;
  }

}
