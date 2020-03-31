import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { UiService } from '../services/ui.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { SectionStatus } from '../interfaces';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.css'],
})
export class WrapperComponent implements OnInit, AfterViewInit, OnDestroy  {

  @ViewChild('rootDiv') rootDiv : ElementRef<HTMLDivElement>;

  subscriptions : Subscription[] = [];
  section : SectionStatus;

  bigPanelState : boolean = true;
  smallPanelState : boolean = false;
  noPanelState : boolean = undefined;

  panelState : boolean = this.bigPanelState;
  innerWidth : number;
  
  noPanel : number = 0;
  smallPanel : number = 1;
  bigPanel : number = 2;
  switchPanel : number = 3;

  constructor(private uiService : UiService) { }

  ngOnInit() {
    this.uiService.stopLoadingScreen();
    this.section = this.uiService.section;

    const subscription = this.uiService.whatToShow$.subscribe((section : SectionStatus) => {
      this.section = section;
    });
    
    this.subscriptions.push(subscription);
  }

  ngAfterViewInit() {
    const subscription = this.uiService.disableElementsNotifier$.subscribe(disableDOMTree => {
      if (disableDOMTree) this.uiService.disableAllElements(this.rootDiv.nativeElement);
      else this.uiService.enableAllElements(this.rootDiv.nativeElement);
    });

    this.subscriptions.push(subscription);
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      if (subscription instanceof Subscription) subscription.unsubscribe();
    }
  }

  togglePanel(event : number) {
    if (this.innerWidth < 700 && event === this.switchPanel) {
      this.panelState = this.panelState === this.noPanelState ? this.smallPanelState : this.noPanelState;
    } else {
      this.panelState = event === this.noPanel ? this.noPanelState : event === this.bigPanel ? this.bigPanelState : event === this.smallPanel ? this.smallPanelState : !this.panelState;
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
