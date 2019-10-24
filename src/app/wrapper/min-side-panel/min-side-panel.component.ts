import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService } from 'src/app/services/image.service';
import { Subscription } from 'rxjs';
import { UserInfoService, UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-min-side-panel',
  templateUrl: './min-side-panel.component.html',
  styleUrls: ['./min-side-panel.component.css']
})
export class MinSidePanelComponent implements OnInit {

  @Output() whatToShow  = new EventEmitter<string>()
  @Input() showProfile : boolean;
  @Input() showConversations : boolean;
  @Input() showUsersInChat;

  subscriptionOne : Subscription;
  subscriptionTwo : Subscription;
  subscriptionThree : Subscription;
  
  userInfo : UserInfo;
  userInitials : string;

  profilePic : string;
  defaultPic : string;
  hasProfilePic : boolean;

  profileIcon : string;
  messageIcon : string;
  friendsIcon : string;

  constructor(private activatedRoute : ActivatedRoute, private imageService : ImageService, private userInfoService : UserInfoService) { }

  ngOnInit() {
    const resolvedData = this.activatedRoute.data;
    const picNotifier$ = this.imageService.profilePicNotifier$;

    this.subscriptionOne = resolvedData.subscribe(data => {
      let picSrc = <string>data.image[0], iconLookup = data.image[1];
      this.userInfo = data.user;
      this.userInitials = this.userInfoService.getInitials(this.userInfo.firstname, this.userInfo.lastname);
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
      }
      this.userInitials = this.userInfoService.getInitials(this.userInfo.firstname, this.userInfo.lastname);

    },  err => console.log(err));
  }
  ngOnDestroy() {
    if (this.subscriptionOne  instanceof Subscription)this.subscriptionOne.unsubscribe()
    if (this.subscriptionTwo  instanceof Subscription)this.subscriptionTwo.unsubscribe()
    if (this.subscriptionThree  instanceof Subscription)this.subscriptionTwo.unsubscribe()
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
    } else if (section === 'showUsersInChat'){
      this.showConversations = false;
      this.showProfile = false;
      this.showUsersInChat = true;
    }
    this.whatToShow.emit(section);
  }
}
