import { Component, OnInit, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
import { ConversationInfoService } from 'src/app/services/conversation-info.service';
import { UiService} from 'src/app/services/ui.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  subscriptions : Subscription[] = [];

  @Input() conversationId : string;
  @Output() exit : EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private conversationInfoService : ConversationInfoService, 
    private uiService : UiService, 
    private authService : AuthService
  ) { }

  ngOnInit() {
    this.conversationInfoService.isInChat = true;
    this.conversationInfoService.conversationId = this.conversationId;
   }

  ngOnDestroy() {
    if (!this.authService.hasLoggedIn) {
      this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
      return;
    }
    const inChat = false;

    const subscription = this.conversationInfoService.updateInChatStatus(this.conversationId, inChat).subscribe(() => {
      this.conversationInfoService.isInChat = false;
      this.conversationInfoService.conversationId = "";

      this.subscriptions.push(subscription);
      this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
    });
  }

  exitChat() {
    this.uiService.toggleSidePanel.next(this.uiService.SWITCH_PANEL_STATE);
    this.exit.emit();;
  }

}
