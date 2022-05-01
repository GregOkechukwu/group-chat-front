import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SectionStatus } from '../interfaces';
import { MatSnackBar, MatDialog } from '@angular/material';
import { MessageArchiveComponent } from '../message-archive/message-archive.component';
import { Subscription } from 'rxjs/internal/Subscription';
import { MainDialogComponent } from '../dialogs/main-dialog/main-dialog.component';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})

export class UiService implements OnDestroy {

  private _section : SectionStatus =  {
    showProfile : false,
    showConversations : true,
    showInvites : false,
    showFriends : false
  }

  private _showProgressBar : boolean = false;
  private _hasUsedResolver : boolean = false;

  private _NO_PANEL_STATE : number = 0;
  private _SMALL_PANEL_STATE : number = 1;
  private _BIG_PANEL_STATE : number = 2;
  private _SWITCH_PANEL : number = 3;

  disableElementsNotifier = new Subject<boolean>();
  disableElementsNotifier$ = this.disableElementsNotifier.asObservable();

  whatToShow = new BehaviorSubject<SectionStatus>(this.section);
  whatToShow$ = this.whatToShow.asObservable();

  toggleSidePanel = new Subject<number>();
  toggleSidePanel$ = this.toggleSidePanel.asObservable();

  subscriptions : Subscription[] = [];

  constructor(
    private snackbar : MatSnackBar, 
    private matDialog : MatDialog
  ) { }

  get showProgressBar() {
    return this._showProgressBar;
  }

  set showProgressBar(isShown : boolean) {
    this._showProgressBar = isShown;
  }

  get hasUsedResolver() {
    return this._hasUsedResolver;
  }

  set hasUsedResolver(hasUsedResolver : boolean) {
    this._hasUsedResolver = hasUsedResolver;
  }

  get section() {
    return this._section;
  }

  set section(section : SectionStatus) {
    this._section = section;
  }

  get NO_PANEL_STATE() {
    return this._NO_PANEL_STATE;
  }

  get SMALL_PANEL_STATE() {
    return this._SMALL_PANEL_STATE
  }

  get BIG_PANEL_STATE() {
    return this._BIG_PANEL_STATE;
  }

  get SWITCH_PANEL_STATE() {
    return this._SWITCH_PANEL;
  }

  ngOnDestroy() {
    this.unsubscribeFromSubscriptions(this.subscriptions);
  }

  disableAllElements(el : Element) {
    const n = el.children.length;
    (<HTMLElement>el).style.pointerEvents = 'none';

    if (n === 0) {
      return;
    }

    for (let i = 0; i < n; i++) {
      const child : Element = el.children.item(i);
      this.disableAllElements(child);
    }
  }

  enableAllElements(el : Element) {
    const n = el.children.length;
    (<HTMLElement>el).style.pointerEvents = '';
    
    if (n === 0) {
      return;
    }

    for (let i = 0; i < n; i++) {
      const child : Element = el.children.item(i);
      this.enableAllElements(child);
    }
  }

  styleBorder(hasProfilePic : boolean) {
    return {
      'border' : `1px solid ${hasProfilePic ? 'black' : 'white'}`
    }
  }

  startLoadingScreen() {
    const disableDOMTree = true;
    this.disableElementsNotifier.next(disableDOMTree);
    this.showProgressBar = true;
  }

  stopLoadingScreen() {
    const disableDOMTree = false;
    this.disableElementsNotifier.next(disableDOMTree);
    this.showProgressBar = false;
  }

  openSnackBar(mssg : string) {
    this.snackbar.openFromComponent(MessageArchiveComponent, { data : mssg });
  }

  showSection(sectionName : string) {
    for (const key in this.section) {
      this.section[key] = key === sectionName;
    }

    this.whatToShow.next(this.section);
  }

  openDialog(heightPx : string, widthPx : string, dialogTitle : string, dialogContent : any, checkResponse : Function, component : any = MainDialogComponent) {
    const height = heightPx;
    const width = widthPx;
    const title = dialogTitle;
    const content = dialogContent;

    const dialogRef = this.matDialog.open(component, {
      height,
      width,
      data : {
        title, 
        content
      }
    });

    const subscription = dialogRef.afterClosed().subscribe((choseYesOrNo : boolean) => checkResponse(choseYesOrNo));
    this.subscriptions.push(subscription);
  }

  unsubscribeFromSubscriptions(subscriptions : Subscription[]) {
    for (const subscription of subscriptions) {
      if (subscription instanceof Subscription) {
        subscription.unsubscribe();
      }
    }
  }
}
