import { Component, OnInit, EventEmitter, Output, Input, OnDestroy, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, ComponentFactory } from '@angular/core';
import { ConversationInfoService } from 'src/app/services/conversation-info.service';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { UserMessage, TopicSubscription, Message, Greeting } from 'src/app/interfaces';
import { DataManipulationService } from 'src/app/services/data-manipulation.service';
import { WebSocketService } from 'src/app/services/websocket.service';
import { CurrentUserMessageComponent } from '../current-user-message/current-user-message.component';
import { OtherUserMessageComponent } from '../other-user-message/other-user-message.component';
import { ChatGreetingComponent } from '../chat-greeting/chat-greeting.component';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  subscriptions : Subscription[] = [];
  topicSubscriptions : any[] = [];

  @ViewChild("chatContainer", { read : ViewContainerRef }) chatContainer : ViewContainerRef;

  @Input() userId : string;
  @Input() username : string;
  @Input() firstName : string;
  @Input() lastName : string;
  @Input() conversationId : string;
  @Input() userPanelIsShown : boolean;
  @Input() userMessages: UserMessage[];
  
  @Output() exit : EventEmitter<void> = new EventEmitter<void>();
  @Output() toggleUserPanel : EventEmitter<boolean> = new EventEmitter<boolean>();

  chatMessage : string = "";

  constructor(
    private imageService : ImageService,
    private conversationInfoService : ConversationInfoService, 
    private uiService : UiService, 
    private authService : AuthService,
    private messageService : MessageService,
    private dataManipulationService : DataManipulationService,
    private webSocketService : WebSocketService,
    private factoryResolver : ComponentFactoryResolver
  ) { }

  ngOnInit() {
    const isInChat = true;

    this.conversationInfoService.isInChat = isInChat;
    this.conversationInfoService.conversationId = this.conversationId;

    this.subscribeToTopics(this.getTopicSubscriptions());
    this.publishGreeting(`${this.dataManipulationService.formatName(this.firstName)} ${this.dataManipulationService.formatName(this.lastName)} has joined the chat room...`);
  }

  ngOnDestroy() {
    const isInChat = false;

    if (!this.authService.hasLoggedIn) {
      this.publishGreeting(`${this.dataManipulationService.formatName(this.firstName)} ${this.dataManipulationService.formatName(this.lastName)} has left the chat room...`);
      this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
      this.webSocketService.unsubscribeFromTopicSubscriptions(this.topicSubscriptions);
      
      return;
    }

    const subscription = this.conversationInfoService.updateInChatStatus(this.conversationId, isInChat).subscribe(() => {
      this.conversationInfoService.isInChat = isInChat;
      this.conversationInfoService.conversationId = "";
      this.publishGreeting(`${this.dataManipulationService.formatName(this.firstName)} ${this.dataManipulationService.formatName(this.lastName)} has left the chat room...`);

      this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
      this.webSocketService.unsubscribeFromTopicSubscriptions(this.topicSubscriptions);
    });

    this.subscriptions.push(subscription);
  }

  onToggleUserPanel() {
    this.userPanelIsShown = !this.userPanelIsShown;
    this.toggleUserPanel.emit(this.userPanelIsShown);
  }

  exitChat() {
    this.uiService.toggleSidePanel.next(this.uiService.SWITCH_PANEL_STATE);
    this.exit.emit();
  }

  sendChatMessage() {
    const messageContent = this.dataManipulationService.trim(this.chatMessage);
    const dateTime = new Date().toUTCString();
    
    if (messageContent == null || messageContent.length == 0) {
      return;
    }

    const subscription = this.messageService.createMessage(this.conversationId, messageContent, dateTime).subscribe((messageId : string) => {
      this.publishChatMessage(messageId, messageContent, dateTime);
      this.chatMessage = "";
    });

    this.subscriptions.push(subscription);
  }

  publishGreeting(greetingContent : string) {
    this.webSocketService.publishMessage(`chat/greeting-pub`, { greetingContent, userId : this.userId, firstName : this.firstName, lastName : this.lastName });
  }

  publishChatMessage(messageId : string, messageContent : string, dateSent : string) {
    this.webSocketService.publishMessage(`chat/message-pub`, 
      {
        userId : this.userId,
        username : this.username,
        firstName : this.firstName,
        lastName : this.lastName,
        isOnline : true,
        hasProfilePic : this.imageService.hasProfilePic,
        base64 : this.imageService.base64,
        mimeType : this.imageService.mimeType,
        messageId,
        messageContent,
        dateSent
      }
    );
  }

  getTopicSubscriptions() : TopicSubscription[] {
    const _this = this;

    function greetingSubscriptionHandler(payload) {
      const greeting : Greeting = JSON.parse(payload.body);

      if (greeting.userId === _this.userId) {
        _this.renderGreeting(greeting.userId === _this.userId, "You have " + greeting.greetingContent.split(" ").slice(3).join(" "));
        _this.renderChatMessages(_this.userMessages);
      }
      else {
        _this.renderGreeting(greeting.userId === _this.userId, greeting.greetingContent);
      }
    }

    function messageSubscriptionHandler(payload) {
      const message : Message = JSON.parse(payload.body);

      _this.renderChatMessage(
        message.userId == _this.userId,  
        message.userId,
        message.username,
        message.firstName,
        message.lastName,
        message.isOnline,
        message.hasProfilePic,
        message.base64,
        message.mimeType,
        message.messageId,
        message.messageContent,
        message.dateSent
      );
    }
    
    return [
      {
        topicSuffix : 'chat/greeting-sub',
        doSomething : greetingSubscriptionHandler
      },
      {
        topicSuffix : `chat/message-sub`,
        doSomething : messageSubscriptionHandler
      }
    ];
  }

  subscribeToTopics(subscriptions : TopicSubscription[] = []) {
    for (const topic of subscriptions) {
      const subscription = this.webSocketService.subscribeToTopic(topic.topicSuffix, topic.doSomething);
      this.topicSubscriptions.push(subscription);
    }
  }

  renderChatMessages(chatMessages : UserMessage[]) {
    for (const chatMessage of chatMessages) {
      this.renderChatMessage(
        chatMessage.user.userId == this.userId,
        chatMessage.user.userId,
        chatMessage.user.username,
        chatMessage.user.firstName,
        chatMessage.user.lastName,
        chatMessage.user.isOnline,
        chatMessage.user.hasProfilePic,
        chatMessage.user.byteArrBase64,
        chatMessage.user.mimeType,
        chatMessage.message.messageId,
        chatMessage.message.messageContent,
        chatMessage.message.dateSent
      );
    }
  }

  renderChatMessage(
    isCurrentUser : boolean, 
    userId : string,
    username : string,
    firstName : string,
    lastName : string,
    isOnline : boolean,
    hasProfilePic : boolean,
    base64 : string,
    mimeType : string,
    messageId : string,
    messageContent : string,
    dateSent : string
  ) {
    const componentFactory : ComponentFactory<CurrentUserMessageComponent | OtherUserMessageComponent> = isCurrentUser ? this.factoryResolver.resolveComponentFactory(CurrentUserMessageComponent) : this.factoryResolver.resolveComponentFactory(OtherUserMessageComponent);
    const component : ComponentRef<CurrentUserMessageComponent | OtherUserMessageComponent> = this.chatContainer.createComponent(componentFactory);

    component.instance.userId = userId;
    component.instance.username = username;
    component.instance.firstName = firstName;
    component.instance.lastName = lastName;
    component.instance.isOnline = isOnline;
    component.instance.hasProfilePic = hasProfilePic;
    component.instance.base64 = base64;
    component.instance.mimeType = mimeType;
    component.instance.messageId = messageId;
    component.instance.messageContent = messageContent;
    component.instance.dateSent = dateSent;
  }

  renderGreeting(isCurrentUser : boolean, greeting : string) {
    const componentFactory : ComponentFactory<ChatGreetingComponent> = this.factoryResolver.resolveComponentFactory(ChatGreetingComponent);
    const component : ComponentRef<ChatGreetingComponent> = this.chatContainer.createComponent(componentFactory);

    component.instance.isCurrentUser = isCurrentUser;
    component.instance.greeting = greeting;
  }
}
