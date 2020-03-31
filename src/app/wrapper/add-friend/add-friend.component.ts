import { Component, OnInit, TemplateRef, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs';
import { UiService } from 'src/app/services/ui.service';
import { SearchedUser } from 'src/app/interfaces';
import { UserInfoService } from 'src/app/services/user-info.service';
import { FriendRequestInfoService } from 'src/app/services/friend-request-info.service';

@Component({
  selector: 'app-add-friend',
  templateUrl: './add-friend.component.html',
  styleUrls: ['./add-friend.component.css']
})
export class AddFriendComponent implements OnInit, OnDestroy {

  subscriptions : Subscription[] = [];
  
  @ViewChild('searchUserForm') searchUserForm : TemplateRef<any>;
  @ViewChild('searchResults') searchResults : TemplateRef<any>;
  @ViewChild('confirmResults') confirmResults : TemplateRef<any>;

  @Output() goBackToFriends : EventEmitter<void> = new EventEmitter<void>();

  searchUserFormSection : number = 0;
  searchResultsSection  : number = 1;
  confirmResultsSection : number = 2;

  resetFilterNotifier : Subject<void>;
  sectionLookup : Map<number, TemplateRef<any>>;
  section : number;

  searchedUsers : SearchedUser[];
  chosenUsers : boolean[];

  constructor(private friendRequestInfoService : FriendRequestInfoService, private uiService : UiService, private userInfoService : UserInfoService) { }

  ngOnInit() {
    this.resetFilterNotifier = new Subject<void>();
    this.sectionLookup = this.buildSectionLookup();
    this.toSection(this.searchUserFormSection);
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  toSection(section : number) {
    this.section = section;
  }

  goBack() {
    if (this.section == this.searchUserFormSection) {
      this.goBackToFriends.next();
    }
    else {
      this.toSection(this.section - 1);     
    }
  }

  buildSectionLookup() {
    const sectionLookup = new Map<number, TemplateRef<any>>();

    sectionLookup.set(this.searchUserFormSection, this.searchUserForm);
    sectionLookup.set(this.searchResultsSection, this.searchResults);
    sectionLookup.set(this.confirmResultsSection, this.confirmResults);

    return sectionLookup;
  }

  onSearchUsers(username : string, firstName : string, lastName : string) {
    const includeFriends = false;
    this.uiService.startLoadingScreen();

    const subscription = this.userInfoService.getUsers(username, firstName, lastName, includeFriends).subscribe((searchedUsers : SearchedUser[]) => {
      const n = searchedUsers.length;

      this.searchedUsers = searchedUsers;
      this.chosenUsers = new Array<boolean>(n).fill(false);
      this.toSection(this.searchResultsSection);

    }, null, () => this.uiService.stopLoadingScreen());

    this.subscriptions.push(subscription);
  }

  sendFriendRequests(usersToAdd : string[]) {
    const heightPx = "225px", widthPx = "510px";

    this.uiService.openDialog(
      heightPx,
      widthPx,
      "Confirm Friend Requests",
      "Are you sure you want to send friend requests to these users?",
      choseToSendFriendRequests => {
        if (!choseToSendFriendRequests) return;

        this.uiService.startLoadingScreen();

        const subscription = this.friendRequestInfoService.sendFriendRequests(usersToAdd, new Date().toUTCString()).subscribe(() => {
          this.goBackToFriends.next();
          this.uiService.openSnackBar("Sent Friend Requests Successfully");
    
        }, null, () => this.uiService.stopLoadingScreen());
    
        this.subscriptions.push(subscription);
      }
    );
  }

}
