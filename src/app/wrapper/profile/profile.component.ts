import { Component,  OnInit,  ViewChild,  TemplateRef,  ViewChildren,  QueryList,  OnDestroy, ElementRef, OnChanges, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormValidatorService } from 'src/app/services/form-validator.service';
import { Observable,  Subscription,  timer } from 'rxjs';
import { UserInfoService } from 'src/app/services/user-info.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalContent } from '../modal/modal-content.component';
import { UiService } from 'src/app/services/ui.service';

interface UserForm {
  username : boolean;
  firstname : boolean;
  lastname : boolean;
  email : boolean;
}
@Component({
  selector :  'app-profile', 
  templateUrl :  './profile.component.html', 
  styleUrls :  ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  private timer : Observable<number>;

  private subscriptionOne : Subscription;
  private subscriptionTwo : Subscription;
  private subscriptionThree : Subscription;
  
  @ViewChild('updateDefault') updateDefault : TemplateRef<any>;
  @ViewChild('updateProfileForm') updateProfile : TemplateRef<any>
  @ViewChild('updatePicForm') updatePic : TemplateRef<any>
  @ViewChild('chooseUpdate') chooseUpdate : TemplateRef<any>

  @ViewChildren('inputForms') inputForms : QueryList<ElementRef<any>>

  userInfoPayload : Object;
  forms : UserForm;
  formSwitch : number;
  fieldCount : number = 0;

  username : string;
  firstname : string;
  lastname : string; 
  email : string

  successMssg : string;
  errMssg : string
  emptyFields : boolean;
  validEmail : boolean;
  validUsername : boolean;
  successfulUpdate : boolean;

  minSidePanelIsVisible : boolean;

  constructor(private cdRef : ChangeDetectorRef, private uiService : UiService, private formValidator : FormValidatorService,  private userInfoService : UserInfoService, private modalService : NgbModal) { 
    this.formSwitch  =  undefined;
    this.emptyFields = false;
    this.validEmail =  true;
    this.validUsername = true;
    this.successfulUpdate = false;

    this.forms = { 
      username : false,
      firstname :  false, 
      lastname :  false, 
      email :  false
    }
  }

  ngOnInit() { 
    this.timer = timer(3000);
 
    this.subscriptionThree = this.uiService.minSidePanelStatus$.subscribe(status => {
      if (status !== undefined) {
        this.minSidePanelIsVisible = status;
      }  
    });
  }
  ngAfterViewInit() {
    this.subscriptionTwo = this.inputForms.changes.subscribe(data => {
      if (this.formSwitch === 1) {
        this.inputForms.first.nativeElement.focus();
      }
    }, err => console.log(err))
  }

  ngOnDestroy() {
    if (this.subscriptionOne instanceof Subscription) this.subscriptionOne.unsubscribe();
    if (this.subscriptionTwo instanceof Subscription) this.subscriptionTwo.unsubscribe();
    if (this.subscriptionThree instanceof Subscription) this.subscriptionThree.unsubscribe();
  }

  disableFlag(S : string, callback? : Function) {
    this.subscriptionOne = this.timer.subscribe(num => {
      if (S === 'emptyFields') this.emptyFields = false
      if (S === 'validEmail') this.validEmail = true
      if (S === 'validUsername') this.validUsername = true
      if (S === 'successfulUpdate') this.successfulUpdate = false;
      if (callback) callback();
    });
  }

  async validateInputs(callback : Function) {
    try {
      let validInputs = await new Promise<boolean>((resolve, reject) => {
        let emptyInputs = this.formValidator.checkForEmptyInputs(this.inputForms);
        let anInputIsEmpty = emptyInputs.emptyFields;
        let errMssg = emptyInputs.errStr;

        if (anInputIsEmpty) { 
          this.errMssg = errMssg;
          this.emptyFields = true;

          this.cdRef.detectChanges()
          this.disableFlag('emptyFields', () => reject());
          return;

        } else if (this.username && !this.formValidator.strLengthIsValid(this.username)) {
          reject();
          return;
        }
        
        else if (this.email && !this.formValidator.checkEmailStr(this.email)) {
          this.errMssg = "Invalid Email"
          this.validEmail = false;

          this.cdRef.detectChanges()
          this.disableFlag('validEmail', () => reject());
          return;
        }
        this.checkUsernameAvailability(isAvailable => {
          if (!isAvailable) {
            reject();
          } else {
            this.checkEmailAvailablility(isAvailable => isAvailable ? resolve(isAvailable) : reject());
          }
        });
      });

      callback(validInputs);

    } catch (err) {
      callback(false);

    }

  }

  checkUsernameAvailability(resolveReject : Function) {
    if (this.username) {
      this.userInfoService.checkAvailability('username', this.username).subscribe(isAvailable => {
        if (!isAvailable) {
          this.errMssg = "Username is not available";
          this.validUsername = false;

          this.cdRef.detectChanges()
          this.disableFlag('validUsername');
        } 
        resolveReject(isAvailable);

      });
    } else {
      resolveReject(true);
    }
  }

  checkEmailAvailablility(resolveReject : Function) {
    if (this.email) {
      this.userInfoService.checkAvailability('email', this.email).subscribe(isAvailable => {
        if (!isAvailable) {
          this.errMssg = "Email is not available";
          this.validEmail = false;

          this.cdRef.detectChanges()
          this.disableFlag('validEmail'); 
        }
        resolveReject(isAvailable);

      });
    } else {
      resolveReject(true);
    }
  }

  displaySuccessMssg() {
    this.toSection(undefined);
    this.successMssg = "Your profile has been updated";
    this.successfulUpdate = true;
    this.disableFlag('successfulUpdate');
  }

  addForm(form : string) {
    this.forms[form] = !this.forms[form];
    this.fieldCount += this.forms[form] ? 1 : -1 
  }

  invertColors(form : string) {
    return {
      'background-color' : this.forms[form] ? 'black' : null, 
      'color' : this.forms[form] ? 'white' : null, 
    }
  }

  showNext() {
    for (let form in this.forms) {
      if (this.forms[form]) return true;
    }
    return false;
  }

  toSection(section : number) {
    if (section === 1 && !this.showNext()) return;
    this.formSwitch = section;
  }

  goBack(section : number) {
    for (let key of Object.keys(this.forms)) {
      this.forms[key] = false;
    }
    this.username = this.firstname = this.lastname = this.email = '';
    this.formSwitch = section !== null || section !== undefined ? section : null;
    this.fieldCount = 0;
  }

  updateUserInfo(event : KeyboardEvent | MouseEvent) {
    this.validateInputs(valid => {
      if (valid) {
        this.openModal(event, 'Update', 'update your profile info');
      } 
    });
  }

  openModal(event : KeyboardEvent | MouseEvent, header : string, mssg : string) {
    (<HTMLElement>event.target).blur();
    event.preventDefault();
    const modalRef = this.modalService.open(ModalContent, {centered : true});

    modalRef.componentInstance.header = header;
    modalRef.componentInstance.mssg = mssg;

    modalRef.result.then(confirm => {
      this.userInfoPayload = {};

        for(let field of Object.keys(this.forms)) {
          if (this.forms[field]) {
            if (field === 'username')this.userInfoPayload[field] = this.username.toLowerCase()
            if (field === 'firstname')this.userInfoPayload[field] = this.firstname.toLowerCase()
            if (field === 'lastname')this.userInfoPayload[field] = this.lastname.toLowerCase()
            if (field === 'email')this.userInfoPayload[field] = this.email.toLowerCase()
          }
        }
        this.userInfoService.updateUserInfo(this.userInfoPayload).subscribe(data => {
          this.userInfoService.profileInfoNotifier.next(this.userInfoPayload);
          this.username = this.firstname = this.lastname = this.email = '';

          for (let field of Object.keys(this.forms)) {
            this.forms[field] = false
          }
          this.displaySuccessMssg(); 
        }, err => console.log(err))

    }, dismiss => {
      if (this.inputForms.length > 0) {
        this.inputForms.first.nativeElement.focus();
      }
    });
  }

  adjustHeight() {
    let heightValue = this.minSidePanelIsVisible ? '12rem' : '7rem'
    return {
      'height' : window.innerWidth <= 449 && window.innerWidth >= 372? heightValue : null
    }
  }
}

