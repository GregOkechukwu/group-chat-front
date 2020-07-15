import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ViewContainerRef, ComponentFactoryResolver, ComponentFactory, ComponentRef, ChangeDetectorRef } from '@angular/core';
import { ConversationInfoService } from 'src/app/services/conversation-info.service';
import { UiService } from 'src/app/services/ui.service';
import { Conversation, ChatUser, CurrentUser, UserMessage } from 'src/app/interfaces';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserInfoService } from 'src/app/services/user-info.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { UpdateHostDialogComponent } from 'src/app/dialogs/update-host-dialog/update-host-dialog.component';
import { ConversationDisplayComponent } from '../displays/conversation-display/conversation-display.component';

@Component({
  selector :  'app-conversation',
  templateUrl :  './conversation.component.html',
  styleUrls :  ['./conversation.component.css']
})
export class ConversationComponent implements OnInit, OnDestroy {
  subscriptions : Subscription[] = [];

  conversationContainer : ViewContainerRef;

  @ViewChild("conversationContainer", { read : ViewContainerRef }) set container(container : ViewContainerRef) {
    this.conversationContainer = container;
  }
  @ViewChild('createJoinConversation') createJoinConversation : TemplateRef<any>;
  @ViewChild('userConversations') userConversations : TemplateRef<any>;
  @ViewChild('newConversation') newConversation : TemplateRef<any>;
  @ViewChild('chatRoom') chatRoom : TemplateRef<any>;

  section : number;
  
  createJoinConversationSection : number = 0;
  newConversationSection : number = 1;
  userConversationSection : number = 2;
  chatRoomSection : number = 3;

  userId : string;
  username : string;
  firstName : string;
  lastName : string;
  conversationId : string;
  showUserPanel : boolean = false;
  
  conversations : Conversation[];
  chatUsers : ChatUser[];
  userMessages : UserMessage[];

  constructor(
    private uiService : UiService, 
    private conversationInfoService : ConversationInfoService,
    private userInfoService : UserInfoService,
    private messageService : MessageService,
    private activatedRoute : ActivatedRoute,
    private factoryResolver : ComponentFactoryResolver,
    private changeDetector : ChangeDetectorRef
  ) { }

  ngOnInit() {
    const resolvedData = this.activatedRoute.data;
    this.toSection(this.createJoinConversationSection);
    
    const subscription = resolvedData.subscribe((data : { user : CurrentUser, inviteCount : number, images : any[] }) => {
      this.userId = data.user.userId;
      this.username = data.user.username;
      this.firstName = data.user.firstName;
      this.lastName = data.user.lastName;
    });

    this.subscriptions.push(subscription);
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  goBack() {
      this.section === this.userConversationSection ? this.toSection(this.createJoinConversationSection) :
      this.section === this.chatRoomSection ? this.toSection(this.userConversationSection) :
      this.toSection(this.section - 1);
  }

  onToggleUserPanel(show : boolean) {
    this.showUserPanel = show;
  }

  toSection(section : number, hasCreatedAConversation : boolean = false) {
    if (section == this.userConversationSection) {

      this.getConversation((conversations : Conversation[]) => {
        this.section = section;
        this.renderConversations(conversations);
       
        if (hasCreatedAConversation) {
          this.uiService.stopLoadingScreen();
          this.uiService.openSnackBar("Created Conversation Successfully");
        }

      });

    }
    else {
      this.section = section;
    }
  }

  getConversation(doSomething : Function) {
    this.uiService.startLoadingScreen();
    
    const subscription = this.conversationInfoService.getConversations().subscribe((conversations : Conversation[]) => {
      this.conversations = conversations;  
      doSomething(conversations);

    }, null, () => this.uiService.stopLoadingScreen()); 

    this.subscriptions.push(subscription);
  }

  renderConversation(
    index : number,
    conversationId : string,
    conversationName : string,
    conversationHostId : string,
    conversationHostUsername : string,
    userCount : number,
    hostUser_Base64 : string,
    hostUser_MimeType : string,
    hostUser_hasProfilePic : boolean,
    userA_Base64 : string,
    userA_MimeType : string,
    userA_hasProfilePic : boolean,
    userB_Base64 : string,
    userB_MimeType : string,
    userB_hasProfilePic : boolean
  ) {
    const componentFactory : ComponentFactory<ConversationDisplayComponent> = this.factoryResolver.resolveComponentFactory(ConversationDisplayComponent);
    const component : ComponentRef<ConversationDisplayComponent> = this.conversationContainer.createComponent(componentFactory);

    component.instance.index = index;
    component.instance.conversationId = conversationId;
    component.instance.conversationName = conversationName;
    component.instance.conversationHostId = conversationHostId;
    component.instance.conversationHostUsername = conversationHostUsername;
    component.instance.userCount = userCount;
    component.instance.hostUser_Base64 = hostUser_Base64;
    component.instance.hostUser_MimeType = hostUser_MimeType;
    component.instance.hostUser_hasProfilePic = hostUser_hasProfilePic;
    component.instance.userA_Base64 = userA_Base64;
    component.instance.userA_MimeType = userA_MimeType;
    component.instance.userA_hasProfilePic = userA_hasProfilePic;
    component.instance.userB_Base64 = userB_Base64;
    component.instance.userB_MimeType = userB_MimeType;
    component.instance.userA_hasProfilePic = userB_hasProfilePic;
    component.instance.goToChatRoom.subscribe((conversationId : string) => this.toChatRoom(conversationId));
    component.instance.leave.subscribe((event : { conversationId : string, hostId : string }) => this.leaveConversation(index, event.conversationId, event.hostId));
  }

  renderConversations(conversations : Conversation[]) {
    const n = conversations.length;
    this.changeDetector.detectChanges();
  
    for (let i = 0; i < n; i++) {
      this.renderConversation(
        i, 
        conversations[i].conversationId,
        conversations[i].conversationName,
        conversations[i].conversationHostId,
        conversations[i].conversationHostUsername,
        parseInt(conversations[i].userCount),
        conversations[i].prioritizedPics.hostUser.byteArrBase64,
        conversations[i].prioritizedPics.hostUser.mimeType,
        conversations[i].prioritizedPics.hostUser.hasProfilePic,
        conversations[i].prioritizedPics.prioritizedUserA.byteArrBase64,
        conversations[i].prioritizedPics.prioritizedUserA.mimeType,
        conversations[i].prioritizedPics.prioritizedUserA.hasProfilePic,
        conversations[i].prioritizedPics.prioritizedUserB.byteArrBase64,
        conversations[i].prioritizedPics.prioritizedUserB.mimeType,
        conversations[i].prioritizedPics.prioritizedUserB.hasProfilePic
      );
    }
  }

  toChatRoom(conversationId : string) {
    this.uiService.startLoadingScreen();

    this.userInfoService.getUsersInConversationAsPromise(conversationId)
    .then((chatUsers : ChatUser[]) => {
      this.chatUsers = chatUsers;
      this.conversationId = conversationId;

      return this.messageService.getUserMessagesAsPromise(conversationId);
    })
    .then((userMessages : UserMessage[]) => {
      this.userMessages = userMessages;
      this.uiService.toggleSidePanel.next(this.uiService.NO_PANEL_STATE);
      this.toSection(this.chatRoomSection);
    })
    .finally(() => this.uiService.stopLoadingScreen());
  }

  leaveConversation(idx : number, conversationId : string, conversationHostId : string) {
    const _this = this, heightPx = "225px", widthPx = "500px", n = parseInt(this.conversations[idx].userCount);

    if (n == 1) {
      this.deleteConversation(idx, conversationId);
      return;
    }

    this.uiService.openDialog(
      heightPx,
      widthPx,
      "Confirm Exit",
      "Are you sure you want to leave this conversation?",
      (choseToLeave : boolean) => {
        if (!choseToLeave) {
          return;
        }

        this.userId === conversationHostId ? updateHostAndLeaveConversationHandler() : leaveConversationHandler(true);
      }
    );

    function leaveConversationHandler(startLoadingScreen : boolean) {
      if (startLoadingScreen) {
        _this.uiService.startLoadingScreen();
      }

      const subscription = _this.conversationInfoService.leaveConversation(conversationId).subscribe(() => {
        _this.conversations.splice(idx, 1);
        _this.uiService.openSnackBar("Left Conversation Successfully");
      }, null, () => _this.uiService.stopLoadingScreen());

      _this.subscriptions.push(subscription);
    }

    function updateHostAndLeaveConversationHandler() {
      const heightPx = "500px", widthPx = "400px";

      _this.userInfoService.getUsersInConversationAsPromise(conversationId)
      .then((chatUsers : ChatUser[]) => {
        _this.uiService.openDialog(
          heightPx,
          widthPx,
          "Choose Conversation Host",
          chatUsers,
          (result : { choseToUpdate : boolean, newHostId : string }) => {
            if (!result.choseToUpdate) {
              return;
            }

            console.log(result.newHostId);

            _this.uiService.startLoadingScreen();

            const subscription = _this.conversationInfoService.updateConversationHost(conversationId, result.newHostId).subscribe(() => {
              leaveConversationHandler(false);
            });
            
            _this.subscriptions.push(subscription);
          },
          UpdateHostDialogComponent
        );
      });
    }
  }

  deleteConversation(idx : number, conversationId : string) {
    const heightPx = "225px", widthPx = "500px";

    this.uiService.openDialog(
      heightPx,
      widthPx,
      "Confirm Delete",
      "Are you sure you want to delete this conversation?",
      (choseToDelete : boolean) => {
        if (!choseToDelete) {
          return; 
        }

        this.uiService.startLoadingScreen();

        const subscription = this.conversationInfoService.deleteConversation(conversationId).subscribe(() => {
          this.conversations.splice(idx, 1);
          this.conversationContainer.remove(idx);
          this.uiService.openSnackBar("Deleted Conversation Successfully");
          
        }, null, () => this.uiService.stopLoadingScreen());

        this.subscriptions.push(subscription);
      }
    );
  }
}
