import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { FriendRequest, SearchedUser } from 'src/app/interfaces';
import { UiService } from 'src/app/services/ui.service';
import { FriendRequestInfoService } from 'src/app/services/friend-request-info.service';
import { UserInfoService } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.css']
})
export class FriendComponent implements OnInit, OnDestroy {

  subscriptions : Subscription[] = [];

  @ViewChild('addManageFriends') addManageFriends : TemplateRef<any>;
  @ViewChild('addFriends') addFriends : TemplateRef<any>;
  @ViewChild('manageFriends') manageFriends : TemplateRef<any>;
  @ViewChild('manageFriendRequests') manageFriendRequests : TemplateRef<any>;
  @ViewChild('manageCurrentFriends') manageCurrentFriends : TemplateRef<any>;
  @ViewChild('friendRequestsReceived') friendRequestsReceived : TemplateRef<any>;
  @ViewChild('friendRequestsSent') friendRequestsSent : TemplateRef<any>;
  @ViewChild('currentFriends') currentFriends : TemplateRef<any>;

  section : number;

  addManageFriendsSection : number = 0;
  addFriendsSection : number = 1;
  manageFriendsSection : number = 2;
  currentFriendsSection : number = 3;
  manageFriendRequestsSection : number = 4;
  friendRequestsReceivedSection : number = 5;
  friendRequestsSentSection : number = 6;

  friendRequests : FriendRequest[];
  friends : SearchedUser[];

  constructor(
    private uiService : UiService,
    private userInfoService : UserInfoService,
    private friendRequestInfoService : FriendRequestInfoService
  ) { }

  ngOnInit() {
    this.toSection(this.addManageFriendsSection);
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  toSection(section : number) {
    this.section = section;
  }

  goBack() {
    if (this.section === this.addFriendsSection || this.section === this.manageFriendsSection) {
      this.toSection(this.addManageFriendsSection);
    }
    else if (this.section === this.manageFriendRequestsSection || this.section === this.currentFriendsSection) {
      this.toSection(this.manageFriendsSection);
    }
    else if (this.section === this.friendRequestsReceivedSection || this.section === this.friendRequestsSentSection) {
      this.toSection(this.manageFriendRequestsSection);
    }
  }

  getRecievedFriendRequests() {
    this.uiService.startLoadingScreen();

    const subscription = this.friendRequestInfoService.getReceivedFriendRequests().subscribe((friendRequests : FriendRequest[]) => {
      this.friendRequests = friendRequests;
      this.toSection(this.friendRequestsReceivedSection);

    }, null, () => this.uiService.stopLoadingScreen());

    this.subscriptions.push(subscription);
  }

  getSentFriendRequests() {
    this.uiService.startLoadingScreen();

    const subscription = this.friendRequestInfoService.getSentFriendRequests().subscribe((friendRequests : FriendRequest[]) => {
      this.friendRequests = friendRequests;
      this.toSection(this.friendRequestsSentSection);

    }, null, () => this.uiService.stopLoadingScreen());

    this.subscriptions.push(subscription);
  }

  getCurrentFriends() {
    this.uiService.startLoadingScreen();

    const subscription = this.userInfoService.getFriends("","","").subscribe((friends : SearchedUser[]) => {
      this.friends = friends;
      this.toSection(this.currentFriendsSection);

    }, null, () => this.uiService.stopLoadingScreen());

    this.subscriptions.push(subscription);
  }

  onAcceptOrDeclineFriendRequest(event : {index : number, choseToAccept : boolean}) {
    const {index, choseToAccept} = event;     

    const friendRequestId = this.friendRequests[index].friendRequestId;
    const mssg = choseToAccept ? "Accepted Friend Request Successfully" : "Declined Friend Request Successfully";

    if (choseToAccept) {
      const senderId = this.friendRequests[index].userId;
      this.uiService.startLoadingScreen();

      const subscription = this.friendRequestInfoService.acceptFriendRequest(friendRequestId, senderId, new Date().toUTCString()).subscribe(() => {
        this.friendRequests.splice(index, 1);
        this.uiService.openSnackBar(mssg);
      }, null, () => this.uiService.stopLoadingScreen());

      this.subscriptions.push(subscription);
    }
    else {
      this.uiService.startLoadingScreen();

      const subscription = this.friendRequestInfoService.declineFriendRequest(friendRequestId).subscribe(() => {
        this.friendRequests.splice(index, 1);
        this.uiService.openSnackBar(mssg);

      }, null, () => this.uiService.stopLoadingScreen());

      this.subscriptions.push(subscription);
    }
  }

  onCancelFriendRequest(index : number) {
    const friendRequestId = this.friendRequests[index].friendRequestId;
    const mssg = "Cancelled Friend Request Successfully";

    this.uiService.startLoadingScreen();

    const subscription = this.friendRequestInfoService.cancelFriendRequest(friendRequestId).subscribe(() => {
      this.friendRequests.splice(index, 1);
      this.uiService.openSnackBar(mssg);

    }, null, () => this.uiService.stopLoadingScreen());

    this.subscriptions.push(subscription);
  }

  onRemoveFriend(index : number) {
    const friendId = this.friends[index].userId;
    const mssg = "Removed Friend Successfully";

    this.uiService.startLoadingScreen();

    const subscription = this.userInfoService.removeFriend(friendId).subscribe(() => {
      this.friends.splice(index);
      this.uiService.openSnackBar(mssg);

    }, null, () => this.uiService.stopLoadingScreen());

    this.subscriptions.push(subscription);
  }

}
