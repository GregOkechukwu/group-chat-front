import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService } from 'src/app/services/image.service';
import { UserInfoService } from 'src/app/services/user-info.service';
import { UiService } from 'src/app/services/ui.service';
import { CurrentUser, SectionStatus } from 'src/app/interfaces';
import { InviteInfoService } from 'src/app/services/invite-info.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataManipulationService } from 'src/app/services/data-manipulation.service';

@Component({
  selector: 'app-min-side-panel',
  templateUrl: './min-side-panel.component.html',
  styleUrls: ['./min-side-panel.component.css']
})
export class MinSidePanelComponent implements OnInit, OnDestroy {

  @ViewChild('rootDiv') rootDiv : ElementRef<HTMLDivElement>;
  
  section : SectionStatus;
  subscriptions : Subscription[] = [];
  
  userInfo : CurrentUser;
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
    private dataManipulationService : DataManipulationService,
    private uiService : UiService, 
    private activatedRoute : ActivatedRoute, 
    private imageService : ImageService, 
    private userInfoService : UserInfoService,
    private inviteInfoService : InviteInfoService
  ) { }

  ngOnInit() {  
    this.section = this.uiService.section;

    const resolvedData = this.activatedRoute.data;
    const profilePicNotifier = this.imageService.profilePicNotifier, profilePicNotifier$ = this.imageService.profilePicNotifier$;
    const profileUpdateNotifier = this.userInfoService.profileUpdateNotifier, profileUpdateNotifier$ = this.userInfoService.profileUpdateNotifier$;
    const inviteCountNotifier = this.inviteInfoService.inviteCountNotfier, inviteCountNotifier$ = this.inviteInfoService.inviteCountNotfier$;
    const whatToShow$ = this.uiService.whatToShow$;

    const subscriptionOne = resolvedData.subscribe((data : {user : CurrentUser, inviteCount : number, images : any[]}) => {
      const {user, inviteCount, images} = data;

      const picSrc = <string>images[0];
      const iconLookup = images[1];
      
      this.updateIcons(iconLookup);

      if (!this.uiService.hasUsedResolver) {
        profileUpdateNotifier.next(user);
        inviteCountNotifier.next(inviteCount);
        profilePicNotifier.next(picSrc);
        
        this.uiService.hasUsedResolver = true;
      }
     
    });

    const subscriptionTwo = profilePicNotifier$.subscribe((src : string) => {
      if (src) this.updatePicInfo(src);
    });

    /* IMPLEMENT A CACHE TO IMPROVE PERFORMANCE */
    const subscriptionThree = profileUpdateNotifier$.subscribe((user : CurrentUser) => {
      if (user) this.updateUserInfo(user);
    });

    /* IMPLEMENT A CACHE TO IMPROVE PERFORMANCE */
    const subscriptionFour = inviteCountNotifier$.subscribe((inviteCount : number) => {
      if (inviteCount > -1) this.updateInviteCount(inviteCount);
    });

    const subscriptionFive = whatToShow$.subscribe((section : SectionStatus) => {
      this.section = section;
    });

    this.subscriptions.push(subscriptionOne, subscriptionTwo, subscriptionThree, subscriptionFour, subscriptionFive);
  }
  
  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  updateUserInfo(userInfo : CurrentUser) {
    this.userInitials = this.dataManipulationService.getInitials(userInfo.firstName, userInfo.lastName);
    this.userInfo = userInfo;
  }

  updateInviteCount(inviteCount : number) {
    this.userInfo.inviteCount = inviteCount;
    this.hideMatBadge = inviteCount === 0;
  }

  updatePicInfo(src : string) {
    this.hasProfilePic = this.imageService.hasProfilePic;
    this.profilePic = this.hasProfilePic ? src : undefined;
    this.defaultPic = this.hasProfilePic ? undefined : src;
  }

  updateIcons(icons : Object) {
    this.profileIcon = <string>this.imageService.sanitize(icons['profile-big']);
    this.messageIcon = <string>this.imageService.sanitize(icons['message-big']);
    this.friendsIcon = <string>this.imageService.sanitize(icons['friends-big']);
    this.invitesIcon = <string>this.imageService.sanitize(icons['invitation-big']);
  }
  
  show(sectionName : string) {
    const section = this.uiService.section;

    for (const key in section) {
      section[key] = key === sectionName ? true : false;
    }

    this.uiService.whatToShow.next(section);
  }
}
