import { Component,  OnInit,  Input,  Output,  EventEmitter,  OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ImageService } from 'src/app/services/image.service';
import { UserInfoService, UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector :  'app-side-panel', 
  templateUrl :  './side-panel.component.html', 
  styleUrls :  ['./side-panel.component.css']
})
export class SidePanelComponent implements OnInit, OnDestroy {

  @Output() whatToShow  = new EventEmitter<string>()
  @Input() showProfile;
  @Input() showConversations; 
  @Input() showUsersInChat;

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

  constructor(private activatedRoute : ActivatedRoute,  private imageService : ImageService,  private userInfoService : UserInfoService) { }

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

    }, err => console.log(err));

    this.subscriptionTwo = picNotifier$.subscribe(src => {
      if (src) {
        this.updatePicInfo(src);
      }
    },  err => console.log(err));

    this.subscriptionThree = this.userInfoService.profileInfoNotifier$.subscribe(info => {
      for (let key in info) {
        if (key === 'username')this.userInfo[key] = this.userInfoService.formatUsername(info[key]);
        if (key === 'firstname')this.userInfo[key] = this.userInfoService.formatFirstOrLast(info[key]);
        if (key === 'lastname')this.userInfo[key] = this.userInfoService.formatFirstOrLast(info[key]);
      }
    },  err => console.log(err));
  } 

  ngOnDestroy() {
    if (this.subscriptionOne  instanceof Subscription)this.subscriptionOne.unsubscribe()
    if (this.subscriptionTwo  instanceof Subscription)this.subscriptionTwo.unsubscribe()
    if (this.subscriptionThree  instanceof Subscription)this.subscriptionTwo.unsubscribe()
  }

  updateUserInfo(userInfo : UserInfo) {
    let fullname = this.userInfoService.formatFullName(userInfo.firstname, userInfo.lastname, userInfo.username);
    userInfo.firstname = fullname[0];
    userInfo.lastname = fullname[1];
    userInfo.username = fullname[2];
  }

  updatePicInfo(src : string) {
    this.hasProfilePic = this.imageService.hasProfilePic;
    this.profilePic = this.hasProfilePic ? src : undefined;
    this.defaultPic = this.hasProfilePic ? undefined : src
  }

  updateIcons(icons : Object) {
    this.profileIcon = <string>this.imageService.sanitize(icons['profile']);
    this.messageIcon = <string>this.imageService.sanitize(icons['message']);
    this.friendsIcon = <string>this.imageService.sanitize(icons['friends']);
  }

  show(section : string) {
    if (section === 'showProfile') {
      this.showProfile = true;
      this.showConversations = false;
      this.showUsersInChat = false;
    } else if (section === 'showConversations') {
      this.showConversations = true;
      this.showProfile  = false;
      this.showUsersInChat = false;
    } else if (section === 'showUsersInChat') {
      this.showConversations = false;
      this.showProfile = false;
      this.showUsersInChat = true;
    }
    this.whatToShow.emit(section);
  }

}

