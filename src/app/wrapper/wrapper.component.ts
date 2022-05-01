import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { UiService } from '../services/ui.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { SectionStatus } from '../interfaces';
import { AuthService } from '../services/auth.service';
import { ConversationInfoService } from '../services/conversation-info.service';
import { WebSocketService } from '../services/websocket.service';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.css'],
})
export class WrapperComponent implements OnInit, AfterViewInit, OnDestroy  {

  @ViewChild('rootDiv') rootDiv : ElementRef<HTMLDivElement>;

  subscriptions : Subscription[] = [];
  section : SectionStatus;

  BIG_PANEL : boolean = true;
  SMALL_PANEL : boolean = false;
  NO_PANEL : boolean = undefined;

  CURRENT_PANEL : boolean = this.BIG_PANEL;
  innerWidth : number;

  constructor(
    private uiService : UiService, 
    private authService : AuthService, 
    private conversationInfoService : ConversationInfoService,
    private webSocketService : WebSocketService
  ) { }

  ngOnInit() {
    this.uiService.stopLoadingScreen();
    
    this.authService.hasLoggedIn = true;
    this.section = this.uiService.section;

    const subscriptionOne = this.uiService.whatToShow$.subscribe((section : SectionStatus) => {
      this.section = section;
    });

    const subscriptionTwo = this.uiService.toggleSidePanel$.subscribe((toggleState : number) => {
      this.togglePanel(toggleState);
    });
    
    this.subscriptions.push(subscriptionOne, subscriptionTwo);
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

  togglePanel(event : number) {
    const NO_PANEL_STATE = this.uiService.NO_PANEL_STATE;
    const SMALL_PANEL_STATE = this.uiService.SMALL_PANEL_STATE;
    const BIG_PANEL_STATE = this.uiService.BIG_PANEL_STATE;
    const SWITCH_PANEL_STATE = this.uiService.SWITCH_PANEL_STATE;
    
    if (this.innerWidth < 1000 && event === SWITCH_PANEL_STATE || this.conversationInfoService.isInChat) {
      this.CURRENT_PANEL = this.CURRENT_PANEL === this.NO_PANEL ? this.SMALL_PANEL : this.NO_PANEL;
    } 
    else {
      this.CURRENT_PANEL = 
      event === NO_PANEL_STATE ? this.NO_PANEL : 
      event === BIG_PANEL_STATE ? this.BIG_PANEL : 
      event === SMALL_PANEL_STATE ? this.SMALL_PANEL : !this.CURRENT_PANEL;
    }
  }

  updateWindowWidth(event : number) {
    this.innerWidth = event;
  }

  getGrayOutCSSClass() {
    const showingProgressBar = this.uiService.showProgressBar;

    return {
      'gray-out' : showingProgressBar ? true : false
    }
  }

}
