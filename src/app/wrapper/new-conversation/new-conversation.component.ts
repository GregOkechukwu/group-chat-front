import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { FormValidatorService } from 'src/app/services/form-validator.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { ConversationInfoService } from 'src/app/services/conversation-info.service';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { UiService } from 'src/app/services/ui.service';
import { SearchedUser } from 'src/app/interfaces';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subject } from 'rxjs/internal/Subject';
import { DataManipulationService } from 'src/app/services/data-manipulation.service';

@Component({
  selector: 'app-new-conversation',
  templateUrl: './new-conversation.component.html',
  styleUrls: ['./new-conversation.component.css']
})
export class NewConversationComponent implements OnInit, OnDestroy {

  subscriptions : Subscription[] = [];

  @ViewChild('conversationNameForm') conversationNameForm : TemplateRef<any>;
  @ViewChild('conversationUsersToInvite') conversationUsersToInvite : TemplateRef<any>;
  @ViewChild('searchUsersForm') searchUsersForm : TemplateRef<any>;
  @ViewChild('searchFriendsForm') searchFriendsForm : TemplateRef<any>;
  @ViewChild('searchResults') searchResults : TemplateRef<any>;
  @ViewChild('confirmResults') confirmResults : TemplateRef<any>;
  
  @Output() goToCreateJoinConversation = new EventEmitter<boolean>();

  form : {
    conversationNameForm : FormGroup
  };

  resetFilterNotifier : Subject<void>;
  patternErrLookup : Map<AbstractControl, string>;
  sectionLookup : Map<number, TemplateRef<any>>;
  section : number;

  conversationNameSection : number = 0;
  usersToInviteSection : number = 1;
  searchUsersFormSection : number = 2;
  searchFriendsFormSection : number = 3;
  searchResultsSection : number = 4;
  confirmResultsSection : number = 5;

  searchedUsers : SearchedUser[];
  chosenUsers : boolean[];

  userIsSearched : boolean;

  constructor(
    private dataManipulationService : DataManipulationService,
    private uiService : UiService,
    private formBuilder : FormBuilder,
    private userInfoService : UserInfoService,
    private formValidator : FormValidatorService, 
    private conversationInfoService : ConversationInfoService 
  ) { }

  ngOnInit() {
    const isRequired = true;
    const basicValidators = this.formValidator.getNameValidators(isRequired);

    const conversationNameForm = this.formBuilder.group({
      conversationName : ['', basicValidators]
    });

    this.form = { conversationNameForm };

    this.resetFilterNotifier = new Subject<void>();
    this.patternErrLookup = this.buildPatternErrLookup();
    this.sectionLookup = this.buildSectionLookup();
    this.toSection(this.conversationNameSection);
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  resetForms() {
    if (this.section <= this.conversationNameSection) this.conversationNameControl.reset();
    if (this.section > this.conversationNameSection) this.resetFilterNotifier.next();
  }

  toSection(section : number) {
    this.section = section;
    this.userIsSearched = this.section == this.searchUsersFormSection ? true : this.section == this.searchFriendsFormSection ? false : this.userIsSearched;
  }

  goBack() {
    this.resetForms();

    const goToAppropriateSection = () => {
      if (this.section === this.conversationNameSection) {
        const hasCreatedAConversation = false;
        this.goToCreateJoinConversation.emit(hasCreatedAConversation);
      }
      else if (this.section === this.searchResultsSection) {
        this.toSection(this.userIsSearched ? this.searchUsersFormSection : this.searchFriendsFormSection);
      }
      else if (this.section == this.searchFriendsFormSection) {
        this.toSection(this.usersToInviteSection);
      }
      else {
        this.toSection(this.section - 1);
      }
    }
    
    goToAppropriateSection();
  }

  onSubmit(formName : string) {
    const validateConversationNameForm = () => {
      if (this.dataManipulationService.trim(this.conversationName) === "") {
        return;
      }

      this.checkConversationNameTaken(isTaken => {
        if (isTaken) {
          this.conversationNameControl.setErrors({nameTaken : true})
        } else {
          this.toSection(this.usersToInviteSection);
        }
      });
    }

    if (this.form[formName].invalid && !this.form[formName].disabled) {
      return;
    }

    const validateForm = {
      conversationNameForm : validateConversationNameForm,
    }

    validateForm[formName]();
  }

  onSearchUsers(username : string, firstName : string, lastName : string) {
    const includeFriends = true;
    this.uiService.startLoadingScreen();

    const subscription = this.userInfoService.getUsers(username, firstName, lastName, includeFriends).subscribe((searchedUsers : SearchedUser[]) => {
      const n = searchedUsers.length;

      this.searchedUsers = searchedUsers;
      this.chosenUsers = new Array<boolean>(n).fill(false);

      this.toSection(this.searchResultsSection);
    }, null, () => this.uiService.stopLoadingScreen());

    this.subscriptions.push(subscription);
  }

  onSearchFriends(username : string, firstName : string, lastName : string) {
    this.uiService.startLoadingScreen();

    const subscription = this.userInfoService.getFriends(username, firstName, lastName).subscribe((searchedUsers : SearchedUser[]) => {
      const n = searchedUsers.length;
      
      this.searchedUsers = searchedUsers;
      this.chosenUsers = new Array<boolean>(n).fill(false);

      this.toSection(this.searchResultsSection);
    }, null, () => this.uiService.stopLoadingScreen());

    this.subscriptions.push(subscription);
  }

  checkConversationNameTaken(doSomething : Function) {
    const subscription = this.conversationInfoService.checkConversationNameNotTaken(this.conversationName).subscribe(isTaken => doSomething(isTaken));
    this.subscriptions.push(subscription);
  }

  createConversationAndSendInvites(invitedUsers : string[]) {
    const heightPx = "250px", widthPx = "520px";

    this.uiService.openDialog(
      heightPx,
      widthPx,
      "Confirm Creation",
      "Are you sure you want to create your conversation and invite these users?",
      choseToInviteUsers => {
        if (!choseToInviteUsers) {
          return;
        }
        
        this.uiService.startLoadingScreen();

        this.conversationInfoService.saveConversationAndSendInvites(this.conversationName, invitedUsers, new Date().toUTCString())
        .subscribe(() => {
          const hasCreatedAConversation = true;

          this.resetForms();
          this.goToCreateJoinConversation.emit(hasCreatedAConversation);
        });
      }
    );
  }

  buildSectionLookup() {
    const sectionLookup = new Map<number, TemplateRef<any>>();
    
    sectionLookup.set(this.conversationNameSection, this.conversationNameForm);
    sectionLookup.set(this.usersToInviteSection, this.conversationUsersToInvite);
    sectionLookup.set(this.searchUsersFormSection, this.searchUsersForm);
    sectionLookup.set(this.searchFriendsFormSection, this.searchFriendsForm);
    sectionLookup.set(this.searchResultsSection, this.searchResults);
    sectionLookup.set(this.confirmResultsSection, this.confirmResults);

    return sectionLookup;
  }

  buildPatternErrLookup() {
    const patternErrLookup = new Map<AbstractControl, string>();
    const conversationNameErrMssg = "Invalid Characters";
    
    patternErrLookup.set(this.conversationNameControl, conversationNameErrMssg);
    return patternErrLookup;
  }

  getErrorMessage(control : AbstractControl) {
    const getPatternErrorMessage = () => this.patternErrLookup.get(control);
    let errMssg = "";

    if (control.hasError("minlength")) errMssg = "Too Short";
    if (control.hasError("maxlength")) errMssg = "Too Long";
    if (control.hasError("pattern"))   errMssg = getPatternErrorMessage();
    if (control.hasError("nameTaken")) errMssg = "Name is not Available";
    if (control.hasError("required"))  errMssg = "Required";

    return errMssg;
  }

  get conversationNameControl() {
    return this.form.conversationNameForm.controls.conversationName;
  }

  get conversationName() {
    return this.form.conversationNameForm.controls.conversationName.value;
  }

}
