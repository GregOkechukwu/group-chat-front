import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserInfoService } from 'src/app/services/user-info.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector : 'app-top-panel',
  templateUrl : './top-panel.component.html',
  styleUrls : ['./top-panel.component.css']
})
export class TopPanelComponent implements OnInit {

  subscriptions : Subscription[] = [];

  @ViewChild('rootDiv') rootDiv : ElementRef<HTMLDivElement>;

  @Output() toggle = new EventEmitter<number>();
  @Output() windowWidth = new EventEmitter<number>();

  noPanel : number = 0;
  smallPanel : number = 1;
  bigPanel : number = 2;
  switchPanel : number = 3;

  constructor(
    private uiService : UiService,
    private userInfoService : UserInfoService,
    private authService : AuthService
  ) { }

  ngOnInit() {
    this.uiService.showProgressBar = false;
    this.checkWindowWidth(window.innerWidth);

    this.uiService.stopLoadingScreen();
  }

  ngAfterViewInit() {
    const subscription = this.uiService.disableElementsNotifier$.subscribe(disableDOMTree => {
      if (disableDOMTree) this.uiService.disableAllElements(this.rootDiv.nativeElement);
      else this.uiService.enableAllElements(this.rootDiv.nativeElement);
    });

    this.subscriptions.push(subscription);
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  signOut() {
    const heightPx = "225px", widthPx = "500px";

    this.uiService.openDialog(
      heightPx,
      widthPx,
      "Confirm Sign Out",
      "Are you sure you want to sign out?",
      choseToSignOut => {
        if (!choseToSignOut) return;
        const isOnline = false;
        this.uiService.startLoadingScreen();

        const subscriptionOne = this.userInfoService.updateOnlineStatus(isOnline).subscribe(() => {
          const subscriptionTwo = this.authService.signOut().subscribe(() => {
            this.authService.kickout();
            this.uiService.stopLoadingScreen();

          });

          this.subscriptions.push(subscriptionOne, subscriptionTwo);
        });
      }
    );
  }

  togglePanel(type : number) {
    this.toggle.emit(type);
  }

  checkWindowWidth(width : number) {
    this.windowWidth.emit(width);

    if (width < 415) {
      this.togglePanel(this.noPanel);

    } else if (width < 950) {
      this.togglePanel(this.smallPanel);

    } else if (width > 950) {
      this.togglePanel(this.bigPanel);
    }
  }

  onResize(event) {
    this.checkWindowWidth(event.target.innerWidth);
  }

  getGrayOutCSSClass() {
    const showingProgressBar = this.uiService.showProgressBar;

    return {
      'gray-out' : showingProgressBar ? true : false
    }
  }
}