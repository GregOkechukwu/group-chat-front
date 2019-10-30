import { Component,  OnInit,  Input,  Output,  EventEmitter,  OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ImageService } from 'src/app/services/image.service';
import { UserInfoService, UserInfo } from 'src/app/services/user-info.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector :  'app-side-panel', 
  templateUrl :  './side-panel.component.html', 
  styleUrls :  ['./side-panel.component.css']
})
export class SidePanelComponent implements OnInit, OnDestroy {

  @Output() whatToShow  = new EventEmitter<string>();

  @Input() showProfile : boolean;
  @Input() showConversations : boolean;
  @Input() showUsersInChat : boolean;
  @Input() showInvites : boolean;

  subscriptionOne : Subscription;
  subscriptionTwo : Subscription;
  subscriptionThree : Subscription;

  userInfo : UserInfo;
  profilePic : string;
  defaultPic : string;
  hasProfilePic : boolean;

  profileIcon : string;
  messageIcon : string;
  friendsIcon : string;
  invitesIcon : string;

  hideMatBadge : boolean = false;

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
      let picSrc = <string>data.image[0];
      let iconLookup = data.image[1];
      
      this.userInfo = data.user;

      this.updateUserInfo(this.userInfo);
      this.updatePicInfo(picSrc);
      this.updateIcons(iconLookup);

    }, err => console.log(err));

    this.subscriptionTwo = picNotifier$.subscribe(src => {
      if (src) {
        this.updatePicInfo(src);
      }
    },  err => console.log(err));

    this.subscriptionThree = this.userInfoService.profileInfoNotifier$.subscribe(info => {
      for (let key in info) {
        if (key === 'username')this.userInfo[key] = info[key];
        if (key === 'firstname')this.userInfo[key] = info[key];
        if (key === 'lastname')this.userInfo[key] = info[key]
        if (key === 'invitecount') this.userInfo[key] = info[key];

        this.updateUserInfo(this.userInfo);
      }
    },  err => console.log(err));
  } 

  ngOnDestroy() {
    if (this.subscriptionOne instanceof Subscription)this.subscriptionOne.unsubscribe()
    if (this.subscriptionTwo instanceof Subscription)this.subscriptionTwo.unsubscribe()
    if (this.subscriptionThree instanceof Subscription)this.subscriptionTwo.unsubscribe()
  }

  updateUserInfo(userInfo : any) {
    let fullname = this.userInfoService.formatFullname(userInfo.firstname, userInfo.lastname, userInfo.username);
    userInfo.firstname = fullname[0];
    userInfo.lastname = fullname[1];
    userInfo.username = fullname[2];
    this.hideMatBadge = userInfo.invitecount == 0;
  }

  updatePicInfo(src : string) {
    this.hasProfilePic = this.imageService.hasProfilePic;
    this.profilePic = this.hasProfilePic ? src : undefined;
    this.defaultPic = this.hasProfilePic ? undefined : src;
  }

  updateIcons(iconLookup : Object) {
    this.profileIcon = <string>this.imageService.sanitize(iconLookup['profile']);
    this.messageIcon = <string>this.imageService.sanitize(iconLookup['message']);
    this.friendsIcon = <string>this.imageService.sanitize(iconLookup['friends']);
    this.invitesIcon = <string>this.imageService.sanitize(iconLookup['invitation']);
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

