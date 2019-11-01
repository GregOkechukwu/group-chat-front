import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, Output, EventEmitter, AfterViewInit, ElementRef, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { FormValidatorService } from 'src/app/services/form-validator.service';
import { Observable,  Subscription,  timer } from 'rxjs';
import { UserInfoService, UserInfo } from 'src/app/services/user-info.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalContent } from '../modal/modal-content.component';
import { ConversationInfoService } from 'src/app/services/conversation-info.service';

interface SelectLookup {
  username : boolean
}
interface InviteesMetaData {
  isInvited : boolean;
  searchResults : UserInfo[] | null;
  selectedCount : number;
}
interface Invitees {
  user : InviteesMetaData;
  friend : InviteesMetaData;
}

@Component({
  selector: 'app-new-conversation',
  templateUrl: './new-conversation.component.html',
  styleUrls: ['./new-conversation.component.css']
})
export class NewConversationComponent implements OnInit, AfterViewInit, OnDestroy {
  private timer : Observable<number>;

  private subscriptionOne : Subscription;
  private subscriptionTwo : Subscription;
  private subscriptionThree : Subscription;
  private subscriptionFour : Subscription;
  private subscriptionFive : Subscription;
  private subscriptionSix : Subscription;
  private subscriptionSeven : Subscription;


  @Output() back = new EventEmitter<number>();
  @Output() successfulCreation = new EventEmitter<void>();

  @ViewChild('conversationName') conversationName : TemplateRef<any>;
  @ViewChild('conversationUsersToInvite') conversationUsersToInvite : TemplateRef<any>;

  @ViewChild('searchUsers') searchUsers : TemplateRef<any>;
  @ViewChild('userSearchResult') userSearchResult : TemplateRef<any>;

  @ViewChild('searchFriends') searchFriends : TemplateRef<any>;
  @ViewChild('friendSearchResult') friendSearchResult : TemplateRef<any>;

  @ViewChild('confirmCreation') confirmCreation : TemplateRef<any>;
  @ViewChild('searchBtn') searchBtn : ElementRef<HTMLDivElement>

  @ViewChildren('convNameInput') conversationNameInput : QueryList<any>
  @ViewChildren('convUserSearchInput') conversationUserSearchInput : QueryList<any>
  @ViewChildren('convFriendSearchInput') conversationFriendSearchInput : QueryList<any>


  searchCriterias : string[] = ['All Users','Username', 'First Name', 'Last Name'];
  criteriaIdx : number = 1;
   
  name : string = '';
  searchUserValue : string = '';
  searchFriendValue : string = '';

  errMssg : string;

  validName : boolean = true;
  currTemplate : TemplateRef<any>;

  invites : Invitees = {
    user : {
      isInvited : false,
      searchResults : null,
      selectedCount : 0
    }, 
    friend : {
      isInvited : false,
      searchResults : null,
      selectedCount : 0
    }
  };

  selectLookup : SelectLookup | Object = {};
  allInvitedUsers : UserInfo[];
    
  constructor(
    private modalService : NgbModal, 
    private cdRef : ChangeDetectorRef, 
    private formValidator : FormValidatorService, 
    private userInfoService : UserInfoService,
    private conversationInfoService : ConversationInfoService 
  ) { }

  ngOnInit() {
    this.timer = timer(3000);    
    this.currTemplate = this.conversationName;
  }

  ngAfterViewInit() {
    let manageDisableBlur = queryList => {
      return queryList.changes.subscribe(data => {
        if (this.criteriaIdx === 0) {
          this.disableFirstElement(queryList, true);
          this.blurFirstElement(queryList);
        } else {
          this.disableFirstElement(queryList, false);
          this.focusFirstElement(queryList);
        }
      });
    }


    let nameQL = this.conversationNameInput
    let userSearchQL = this.conversationUserSearchInput;
    let friendSearchQL = this.conversationFriendSearchInput;

    this.focusFirstElement(nameQL);
    this.blurFirstElement(userSearchQL);
    this.blurFirstElement(friendSearchQL);

    this.subscriptionTwo = nameQL.changes.subscribe(data => {
     this.focusFirstElement(nameQL);
    });

    this.subscriptionThree = manageDisableBlur(userSearchQL);
    this.subscriptionFour = manageDisableBlur(friendSearchQL);

  }
  ngOnDestroy() {
    if (this.subscriptionOne instanceof Subscription) this.subscriptionOne.unsubscribe();
    if (this.subscriptionTwo instanceof Subscription) this.subscriptionTwo.unsubscribe();
    if (this.subscriptionThree instanceof Subscription) this.subscriptionThree.unsubscribe();
    if (this.subscriptionFour instanceof Subscription) this.subscriptionFour.unsubscribe();
    if (this.subscriptionFive instanceof Subscription) this.subscriptionFive.unsubscribe();
    if (this.subscriptionSix instanceof Subscription) this.subscriptionSix.unsubscribe();
    if (this.subscriptionSeven instanceof Subscription) this.subscriptionSeven.unsubscribe();
  }

  disableFlag(S : string, callback? : Function) {
    this.subscriptionSix = this.timer.subscribe(num => {
      if (S === 'validName') this.validName = true;
      if (callback) callback(true);
    });
  }

  focusFirstElement(queryList : QueryList<any>) {
    if (queryList.length > 0) {
      queryList.first.nativeElement.focus();
    }
  }

  blurFirstElement(queryList : QueryList<any>) {
    if (queryList.length > 0) {
      queryList.first.nativeElement.blur();
    }
  }

  disableFirstElement(queryList : QueryList<any>, isDisabled : boolean) {
    if (queryList.length > 0) {
      queryList.first.nativeElement.disabled = isDisabled;
    }
  }

  async toForm(curr : TemplateRef<any>, next : TemplateRef<any>, checkFields? : boolean) {

    const focusOnInputFactory = input => () => this.focusFirstElement(input);

    const disableHelper = (errMssg, handler) => {
      this.errMssg = errMssg;
      this.validName = false;
      this.cdRef.detectChanges();
      this.disableFlag('validName', handler)
    }

    if (next === this.conversationUsersToInvite) {
      const focusOnInputHandler = focusOnInputFactory(this.conversationNameInput)

      let res = this.formValidator.checkForEmptyInputs(null, this.name);
      let validLength = this.formValidator.strLengthIsValid(this.name);
      let fieldIsEmpty = res.emptyFields
      let errMssg = res.errStr;
      let conversationNameIsAvailable = await this.conversationInfoService.checkAvailability('name', this.name);

      if (checkFields) {

        if (fieldIsEmpty) {
          disableHelper(errMssg, focusOnInputHandler);
          return;

        } else if (!validLength) {
          disableHelper('Name is too short', focusOnInputHandler);
          return;

        } else if (!conversationNameIsAvailable) {
          disableHelper('Name is not available', focusOnInputHandler);
          return;
        }

      }

    } else if (next === this.userSearchResult) {
      const focusOnInputHandler = focusOnInputFactory(this.conversationUserSearchInput)

      let res = this.formValidator.checkForEmptyInputs(null, this.searchUserValue);
      let fieldIsEmpty = res.emptyFields
      let errMssg = res.errStr;

      if (checkFields) {
        if (this.criteriaIdx > 0 && fieldIsEmpty) {
          disableHelper(errMssg, focusOnInputHandler);
          return;
        } 
      }

      this.queryUsers(done => this.currTemplate = done ? next : curr, this.searchUserValue);
      return;

    } else if (next === this.friendSearchResult) {
      const focusOnInputHandler = focusOnInputFactory(this.conversationFriendSearchInput)

      let res = this.formValidator.checkForEmptyInputs(null, this.searchFriendValue);
      let fieldIsEmpty = res.emptyFields;
      let errMssg = res.errStr;

      if (checkFields) {
        if (this.criteriaIdx > 0 && fieldIsEmpty) {
          disableHelper(errMssg, focusOnInputHandler);
          return;
        }
      }

      this.queryFriends(done => this.currTemplate = done ? next : curr, this.searchFriendValue);
      return;

    } else if (next === this.searchUsers || next === this.searchFriends) {
      this.criteriaIdx = 1;
    } else if (next === this.confirmCreation) {
      this.getAllInvitedUsers();
    }

    this.currTemplate = next; 
  }

  chooseNextForm(curr : TemplateRef<any>) {
    if (curr === this.conversationName) this.toForm(curr, this.conversationUsersToInvite, true);

    if (curr === this.conversationUsersToInvite && this.invites.user.isInvited) this.toForm(curr, this.searchUsers);
    if (curr === this.conversationUsersToInvite && !this.invites.user.isInvited) this.chooseNextForm(this.userSearchResult);

    if (curr === this.searchUsers) this.toForm(curr, this.userSearchResult, true);
    if (curr === this.searchFriends) this.toForm(curr, this.friendSearchResult, true);

    if (curr === this.userSearchResult && this.invites.friend.isInvited) this.toForm(curr, this.searchFriends) 
    if (curr === this.userSearchResult && !this.invites.friend.isInvited) this.chooseNextForm(this.friendSearchResult);

    if (curr === this.friendSearchResult) this.toForm(curr, this.confirmCreation)
  }

  goBack(curr : TemplateRef<any>, page : number | TemplateRef<any>) {

    if (page instanceof TemplateRef) {

      if (page === this.conversationUsersToInvite) {
        this.invites.user.isInvited = false;
        this.invites.friend.isInvited = false;
      }

      if (page === this.conversationName) {
        this.name = '';
      }
      
      if (page === this.searchUsers) {
        this.searchUserValue = '';
        this.resetSelectedUsers('user');
      }

      if (page === this.searchFriends) {
        this.searchFriendValue = '';
        this.resetSelectedUsers('friend');
      }

      this.toForm(curr, page, false);
      this.criteriaIdx = 1;

      return;

    } else if (curr === this.conversationName) {
      this.back.emit(<number>page);
      this.name = '';
    }
  }

  queryUsers(callback : Function, value? : string) {
    let criteria = this.parseSearchCriteria(this.getSearchCriteria());

    this.userInfoService.getUsers(criteria, value ? value.toLowerCase() : null).subscribe((data : UserInfo[]) => {
      this.invites.user.searchResults = this.formatSearchResults(data);
      this.selectLookup = this.unSelectAllUsers(this.invites.user.searchResults, this.selectLookup);
      callback(true);

    }, err => callback(false));

  }

  queryFriends(callback : Function, value? : string) {
    let criteria = this.parseSearchCriteria(this.getSearchCriteria());

    this.userInfoService.getFriends(criteria, value ? value.toLowerCase() : null).subscribe((data : UserInfo[]) => {
      this.invites.friend.searchResults = this.formatSearchResults(data);
      this.selectLookup = this.unSelectAllUsers(this.invites.friend.searchResults, this.selectLookup);
      callback(true);

    }, err => callback(false));
  }

  selectUser(member : string, username : string) {
    this.selectLookup[username] = !this.selectLookup[username]
    this.invites[member].selectedCount += this.selectLookup[username] ? 1 : -1;
  }

  inviteMember(member : string) {
    this.invites[member]['isInvited'] = !this.invites[member]['isInvited'];
  }

  invertColors(member : string) : Object {
    return {
      'background-color' : this.invites[member]['isInvited'] ? 'black' : null,
      'color' : this.invites[member]['isInvited'] ? 'white' : null
    }
  }

  showNext() : boolean {
    for (let member in this.invites) {
      if (this.invites[member]['isInvited']) return true;
    }
    return false;
  }

  getAllInvitedUsers() {
    let allInvitedUsers = {};

    if (this.invites.user.searchResults) {
      let invitedUsers = this.invites.user.searchResults.filter(user => this.selectLookup[user.username]);

      for (let user of invitedUsers) {
        if (!(user.username in allInvitedUsers)) {
          allInvitedUsers[user.username] = user;
        }
      }
    }

    if (this.invites.friend.searchResults) {
      let invitedFriends = this.invites.friend.searchResults.filter(friend => this.selectLookup[friend.username]);

      for (let friend of invitedFriends) {
        if (!(friend.username in allInvitedUsers)) {
          allInvitedUsers[friend.username] = friend;
        }
      }
    }
  
    this.allInvitedUsers = Object.values(allInvitedUsers);
  }

  getSearchCriteria() : string {
    return this.searchCriterias[this.criteriaIdx];
  }

  searchCriteriaToShow() : string {
    return this.criteriaIdx === 0 ? 'Search All Users' : `Search by ${this.getSearchCriteria()}`;
  }

  searchCriteriaPlaceHolder() : string {
    let stringParts = this.searchCriteriaToShow().split(' ');
    return this.criteriaIdx === 1 ? stringParts.slice(-1).join('') : stringParts.slice(-2).join(' ');
  }

  parseSearchCriteria(criteria : string) : string  {
    let criteriaLookup = {'All Users' : null, 'Username' : 'username', 'First Name' : 'firstname', 'Last Name' : 'lastname'};
    return criteriaLookup[criteria];
  }

  toggleSearchCriteria(input : QueryList<any>) {
    let n = this.searchCriterias.length;
    this.criteriaIdx = this.criteriaIdx === n - 1 ? 0 : this.criteriaIdx + 1;

    this.searchUserValue = input === this.conversationUserSearchInput ? '' : this.searchUserValue;
    this.searchFriendValue = input === this.conversationFriendSearchInput ? '' : this.searchFriendValue;

    if (this.criteriaIdx === 0) {
      this.blurFirstElement(input);
      this.disableFirstElement(input, true);
      this.searchBtn.nativeElement.focus();
    } else {
      this.searchBtn.nativeElement.blur();
      this.disableFirstElement(input, false);
      this.focusFirstElement(input);
    }
  }

  formatSearchResults(data : UserInfo[]) : UserInfo[] {
    if (!data || data.length === 0) {
      return [];
    }

    data.forEach(user => {
      let fullname = this.userInfoService.formatFullname(user.firstname, user.lastname, user.username);
      user.firstname = fullname[0];
      user.lastname = fullname[1];
      user.username = fullname[2];
    });

    return data;
  }

  resetSelectedUsers(member : string) {
    let n = this.invites[member]['searchResults'].length;

    for (let i = 0; i < n; i++) {
      let user = this.invites[member]['searchResults'][i]
      this.selectLookup[user.username] = false;
    }

    this.invites[member]['selectedCount'] = 0;
  }

  unSelectAllUsers(searchResults : UserInfo[], selectLookup : SelectLookup | Object) : SelectLookup | Object {
    searchResults.forEach((user : UserInfo) => {
      if (!(user.username in selectLookup)) {
        selectLookup[user.username] = false;
      }
    });

    return selectLookup;
  }

  confirmInvites(event : KeyboardEvent | MouseEvent) {
    this.openModal(event, "Confirm Invites", "invite these users");
  }

  openModal(event : KeyboardEvent | MouseEvent, header : string, mssg : string) {
    (<HTMLElement>event.target).blur();
    event.preventDefault();
    const modalRef = this.modalService.open(ModalContent, {centered : true});

    modalRef.componentInstance.header = header;
    modalRef.componentInstance.mssg = mssg;

    modalRef.result.then(confirm => {
      let conversation = {
        conversation_name : this.name,
        invited_users : this.allInvitedUsers,
        date_created : new Date()
      }

      this.subscriptionSeven = this.conversationInfoService.createConversation(conversation).subscribe(data => {
        this.successfulCreation.emit();
      }, err => console.log(err));
      
    }, dismiss => {});
  }

}
