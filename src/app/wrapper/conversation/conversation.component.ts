import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { timer, Subscription, Observable } from 'rxjs'
import { ConversationInfoService, Conversation } from 'src/app/services/conversation-info.service';
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
  @ViewChild('newConversation') newConversation : TemplateRef<any>

  createJoinConversationPage : number = 0;
  newConversationPage : number = 1;
  userConversationPage : number = 2;
  page : number = 0;

  successfulUpdate : boolean;
  successMssg : string;

  conversations : Conversation[]

  constructor(private conversationInfoService : ConversationInfoService) { }

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
    if (page === this.userConversationPage) {
      this.getConversations(success => {
        if (success) this.page = page;
      });
    } else {
      this.page = page;
    }
  }

  displaySuccessMssg() {
    this.toPage(0);
    this.successfulUpdate = true;
    this.successMssg = 'Your conversation has been created';
    this.disableFlag('successfulUpdate');
  }

  getConversations(callback) {
    this.conversationInfoService.getConversations().subscribe(data => {
      this.conversations = data;
      callback(true)
    }, err => callback(false));
  }
}
