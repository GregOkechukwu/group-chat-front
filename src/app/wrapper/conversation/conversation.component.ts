import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { ConversationInfoService } from 'src/app/services/conversation-info.service';
import { UiService } from 'src/app/services/ui.service';
import { Conversation, ChatUser } from 'src/app/interfaces';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserInfoService } from 'src/app/services/user-info.service';

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
  @ViewChild('chatRoom') chatRoom : TemplateRef<any>;

  section : number;
  
  createJoinConversationSection : number = 0;
  newConversationSection : number = 1;
  userConversationSection : number = 2;
  chatRoomSection : number = 3;

  conversationId : string;
  conversations : Conversation[];
  chatUsers : ChatUser[];

  constructor(
    private uiService : UiService, 
    private conversationInfoService : ConversationInfoService,
    private userInfoService : UserInfoService
  ) { }

  ngOnInit() {
    this.toSection(this.createJoinConversationSection);
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  goBack() {
      this.section === this.userConversationSection ? this.toSection(this.createJoinConversationSection) :
      this.section === this.chatRoomSection ? this.toSection(this.userConversationSection) :
      this.toSection(this.section - 1);
  }

  toSection(section : number, hasCreatedAConversation : boolean = false) {
    this.section = section;

    if (hasCreatedAConversation) {
      this.uiService.openSnackBar("Created Conversation Successfully");
    }
  }

  getConversations() {
    this.uiService.startLoadingScreen();
    
    const subscription = this.conversationInfoService.getConversations().subscribe((conversations : Conversation[]) => {
      this.conversations = conversations;
      this.toSection(this.userConversationSection);
    }, null, () => this.uiService.stopLoadingScreen()); 

    this.subscriptions.push(subscription);
  }

  toChatRoom(conversationId : string) {
    this.uiService.startLoadingScreen();
    
    const subscription = this.userInfoService.getUsersInConversation(conversationId).subscribe((chatUsers : ChatUser[]) => {
      this.chatUsers = chatUsers;
      this.conversationId = conversationId;
      
      this.uiService.toggleSidePanel.next(this.uiService.NO_PANEL_STATE);
      this.toSection(this.chatRoomSection);
    }, null, () => this.uiService.stopLoadingScreen());

    this.subscriptions.push(subscription);
  }

}
