import { Component,  OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageService } from 'src/app/services/image.service';
import { UserInfoService} from 'src/app/services/user-info.service';
import { UiService } from 'src/app/services/ui.service';
import { CurrentUser, SectionStatus, ResolverMetaData } from 'src/app/interfaces';
import { InviteInfoService } from 'src/app/services/invite-info.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataManipulationService } from 'src/app/services/data-manipulation.service';
import { ConversationInfoService } from 'src/app/services/conversation-info.service';

@Component({
  selector :  'app-side-panel', 
  templateUrl :  './side-panel.component.html', 
  styleUrls :  ['./side-panel.component.css']
})
export class SidePanelComponent implements OnInit, OnDestroy {

  @ViewChild('rootDiv') rootDiv : ElementRef<HTMLDivElement>;

  section : SectionStatus;
  subscriptions : Subscription[] = [];

  userInfo : CurrentUser;
  profilePic : string;
  defaultPic : string;
  hasProfilePic : boolean;

  profileIcon : string;
  messageIcon : string;
  friendsIcon : string;
  invitesIcon : string;

  hideMatBadge : boolean = false;

  constructor(
    private dataManipulationService : DataManipulationService,
    private uiService : UiService, 
    private activatedRoute : ActivatedRoute,  
    private imageService : ImageService,  
    private userInfoService : UserInfoService,
    private inviteInfoService : InviteInfoService,
    private conversationInfoService : ConversationInfoService
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
      if (!user) {
        return;
      }

      resolvedData.subscribe((data : ResolverMetaData) => {
        data.user = user;
        this.updateUserInfo(user);
      });
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
    const fullname = this.dataManipulationService.formatFullname(userInfo.firstName, userInfo.lastName, userInfo.username);
    userInfo.firstName = fullname[0];
    userInfo.lastName = fullname[1];
    userInfo.username = fullname[2];
    
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

  updateIcons(iconLookup : Object) {
    this.profileIcon = <string>this.imageService.sanitize(iconLookup['profile']);
    this.messageIcon = <string>this.imageService.sanitize(iconLookup['message']);
    this.friendsIcon = <string>this.imageService.sanitize(iconLookup['friends']);
    this.invitesIcon = <string>this.imageService.sanitize(iconLookup['invitation']);
  }

  show(sectionName : string) {
    if (!this.conversationInfoService.isInChat) {
      this.uiService.showSection(sectionName);
      return;
    }
    
    this.conversationInfoService.confirmBeforeExitingChat(() => {
      this.uiService.startLoadingScreen();
      this.uiService.showSection(sectionName);
      this.uiService.stopLoadingScreen();
    });
  }

}

