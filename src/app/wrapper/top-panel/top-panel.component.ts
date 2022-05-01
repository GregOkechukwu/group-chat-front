import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserInfoService } from 'src/app/services/user-info.service';
import { UiService } from 'src/app/services/ui.service';
import { ConversationInfoService } from 'src/app/services/conversation-info.service';

@Component({
  selector : 'app-top-panel',
  templateUrl : './top-panel.component.html',
  styleUrls : ['./top-panel.component.css']
})
export class TopPanelComponent implements OnInit {

  subscriptions : Subscription[] = [];

  @ViewChild('rootDiv') rootDiv : ElementRef<HTMLDivElement>;
  @Output() windowWidth : EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private uiService : UiService,
    private userInfoService : UserInfoService,
    private authService : AuthService,
    private conversationInfoService : ConversationInfoService
  ) { }

  ngOnInit() {
    this.uiService.showProgressBar = false;
    this.checkWindowWidth(window.innerWidth);
  }

  ngAfterViewInit() {
    const subscription = this.uiService.disableElementsNotifier$.subscribe((disableDOMTree : boolean) => {
      if (disableDOMTree) {
        this.uiService.disableAllElements(this.rootDiv.nativeElement);
      }
      else {
        this.uiService.enableAllElements(this.rootDiv.nativeElement);
      }
    });

    this.subscriptions.push(subscription);
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

 signOut() {
    const heightPx = "225px", widthPx = "500px", isOnline = false, inChat = false;

    this.uiService.openDialog(
      heightPx,
      widthPx,
      "Confirm Sign Out",
      "Are you sure you want to sign out?",
      choseToSignOut => {

        if (!choseToSignOut) {
          return;
        }

        this.uiService.startLoadingScreen();

        this.conversationInfoService.updateInChatStatusAsPromise(this.conversationInfoService.conversationId, inChat)
        .then(() => this.userInfoService.updateOnlineStatusAsPromise(isOnline))
        .then(() => this.authService.signOutAsPromise())
        .finally(() => {
          this.authService.kickout();
          this.uiService.stopLoadingScreen();
        });
      });
  }

  toggleSidePanel(toggleState : number) {
    this.uiService.toggleSidePanel.next(toggleState);
  }

  checkWindowWidth(width : number) {
    this.windowWidth.emit(width);

    if (this.conversationInfoService.isInChat) {
      return;
    }

    if (width < 415) {
      this.toggleSidePanel(this.uiService.NO_PANEL_STATE);

    } else if (width < 950) {
      this.toggleSidePanel(this.uiService.SMALL_PANEL_STATE);

    } else if (width > 950 && !this.conversationInfoService.isInChat) {
      this.toggleSidePanel(this.uiService.BIG_PANEL_STATE);
    }
  }

  onResize(event : any) {
    this.checkWindowWidth(event.target.innerWidth);
  }

  getGrayOutCSSClass() {
    const showingProgressBar = this.uiService.showProgressBar;

    return {
      'gray-out' : showingProgressBar ? true : false
    }
  }
}