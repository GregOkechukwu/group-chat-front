import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { timer, Subscription, Observable } from 'rxjs'
@Component({
  selector :  'app-conversation',
  templateUrl :  './conversation.component.html',
  styleUrls :  ['./conversation.component.css']
})
export class ConversationComponent implements OnInit, OnDestroy {
  private timer : Observable<number>;
  private subscriptionOne : Subscription;

  @ViewChild('createJoinConversation') createJoinConversation : TemplateRef<any>
  @ViewChild('userConversations') userConversations : TemplateRef<any>
  @ViewChild('conversationForm') conversationForm : TemplateRef<any>

  page : number = 0;
  successfulUpdate : boolean;
  successMssg : string;

  constructor() { }

  ngOnInit() {
    this.timer = timer(3000);
  }

  ngOnDestroy() {
    if (this.subscriptionOne instanceof Subscription) this.subscriptionOne.unsubscribe();
  }

  disableFlag(S : string) {
    this.subscriptionOne = this.timer.subscribe(num => {
      if (S === 'successfulUpdate') this.successfulUpdate = false;
    });
  }

  toPage(page : number) {
    this.page = page;
  }

  displaySuccessMssg() {
    this.toPage(0);
    this.successfulUpdate = true;
    this.successMssg = 'Your conversation has been created'
    this.disableFlag('successfulUpdate');
  }
}
