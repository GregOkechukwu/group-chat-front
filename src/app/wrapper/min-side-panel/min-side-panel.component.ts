import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService } from 'src/app/services/image.service';
import { Subscription } from 'rxjs';
import { UserInfoService, UserInfo } from 'src/app/services/user-info.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-min-side-panel',
  templateUrl: './min-side-panel.component.html',
  styleUrls: ['./min-side-panel.component.css']
})
export class MinSidePanelComponent implements OnInit {

  @Output() whatToShow  = new EventEmitter<string>();

  @Input() showProfile : boolean;
  @Input() showConversations : boolean;
  @Input() showUsersInChat : boolean;
  @Input() showInvites : boolean;

  subscriptionOne : Subscription;
  subscriptionTwo : Subscription;
  subscriptionThree : Subscription;
  subscriptionFour : Subscription;
  
  userInfo : UserInfo;
  userInitials : string;

  profilePic : string;
  defaultPic : string;
  hasProfilePic : boolean;

  profileIcon : string;
  messageIcon : string;
  friendsIcon : string;
  invitesIcon : string;

  hideMatBadge : boolean = true;

  constructor(
    private uiService : UiService, 
    private activatedRoute : ActivatedRoute, 
    private imageService : ImageService, 
    private userInfoService : UserInfoService
  ) { }

  ngOnInit() {
    const resolvedData = this.activatedRoute.data;
    const picNotifier$ = this.imageService.profilePicNotifier$;

    this.subscriptionOne = resolvedData.subscribe(data => {
      let picSrc = <string>data.image[0]
      let iconLookup = data.image[1];

      this.userInfo = data.user;
      
      this.updateUserInfo(this.userInfo);
      this.updatePicInfo(picSrc);
      this.updateIcons(iconLookup);
    });

    this.subscriptionTwo = picNotifier$.subscribe(src => {
      if (src) {
        this.updatePicInfo(src);
      }
    },  err => console.log(err));

    this.subscriptionThree = this.userInfoService.profileInfoNotifier$.subscribe(info => {
      for (let key in info) {
        if (key === 'username')this.userInfo[key] = info[key]
        if (key === 'firstname')this.userInfo[key] = info[key]
        if (key === 'lastname')this.userInfo[key] = info[key]
        if (key === 'invitecount') this.userInfo[key] = info[key];
      }
      this.updateUserInfo(this.userInfo);

    });

    this.subscriptionFour = this.userInfoService.inviteCountNotifier$.subscribe(count => {
      let invitecount = parseInt(this.userInfo.invitecount)
      this.userInfo.invitecount = (invitecount + count).toString();
      this.hideMatBadge = this.userInfo.invitecount === '0' 

    });
  }
  ngOnDestroy() {
    let subscriptions = [this.subscriptionOne, this.subscriptionTwo, this.subscriptionThree, this.subscriptionFour]

    for (let subscription of subscriptions) {
      if (subscription instanceof Subscription) subscription.unsubscribe()
    }

  }

  updateUserInfo(userInfo : any) {
    this.userInitials = this.userInfoService.getInitials(userInfo.firstname, userInfo.lastname);
    this.hideMatBadge = userInfo.invitecount === '0';
  }

  updatePicInfo(src : string) {
    this.hasProfilePic = this.imageService.hasProfilePic;
    this.profilePic = this.hasProfilePic ? src : undefined;
    this.defaultPic = this.hasProfilePic ? undefined : src
  }

  updateIcons(icons : Object) {
    this.profileIcon = <string>this.imageService.sanitize(icons['profile-big']);
    this.messageIcon = <string>this.imageService.sanitize(icons['message-big']);
    this.friendsIcon = <string>this.imageService.sanitize(icons['friends-big']);
    this.invitesIcon = <string>this.imageService.sanitize(icons['invitation-big']);
  }
  
  show(section : string) {
    let sectionStatus = this.uiService.showSectionAndGetStatus(section);
    
    this.showProfile = sectionStatus.showProfile;
    this.showConversations = sectionStatus.showConversation;
    this.showUsersInChat = sectionStatus.showUsersInChat;
    this.showInvites = sectionStatus.showInvites;

    this.whatToShow.emit(section);
  }
}
