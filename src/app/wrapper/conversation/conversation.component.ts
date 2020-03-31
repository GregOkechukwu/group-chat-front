import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { ConversationInfoService } from 'src/app/services/conversation-info.service';
import { UiService } from 'src/app/services/ui.service';
import { Conversation } from 'src/app/interfaces';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector :  'app-conversation',
  templateUrl :  './conversation.component.html',
  styleUrls :  ['./conversation.component.css']
})
export class ConversationComponent implements OnInit, OnDestroy {
  subscriptions : Subscription[] = [];

  @ViewChild('createJoinConversation') createJoinConversation : TemplateRef<any>;
  @ViewChild('userConversations') userConversations : TemplateRef<any>;
  @ViewChild('newConversation') newConversation : TemplateRef<any>;
  
  section : number;
  
  createJoinConversationSection : number = 0;
  newConversationSection : number = 1;
  userConversationSection : number = 2;

  conversations : Conversation[];

  constructor(private uiService : UiService, private conversationInfoService : ConversationInfoService) { }

  ngOnInit() {
    this.toSection(this.createJoinConversationSection);
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  toSection(section : number, hasCreatedAConversation : boolean = false) {
    this.section = section;
    if (hasCreatedAConversation) this.uiService.openSnackBar("Created Conversation Successfully");
  }

  getConversations() {
    this.uiService.startLoadingScreen();
    
    const subscription = this.conversationInfoService.getConversations().subscribe((conversations : Conversation[]) => {
      this.conversations = conversations;
      this.toSection(this.userConversationSection);
    }, null, () => this.uiService.stopLoadingScreen()); 

    this.subscriptions.push(subscription);
  }


}
