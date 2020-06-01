import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { UserInfoService } from './user-info.service';
import { Availability, Conversation } from '../interfaces';
import { UiService } from './ui.service';
import { Subscription } from 'rxjs/internal/Subscription';

const conversationPath = 'conversation';

@Injectable({
  providedIn: 'root'
})
export class ConversationInfoService implements OnDestroy {
  subscriptions : Subscription[] = [];

  private _isInChat : boolean = false;
  private _conversationId : string = "";

  constructor(private http : HttpClient, private userInfoService : UserInfoService, private uiService : UiService) { }
 
  get isInChat() {
    return this._isInChat;
  }

  set isInChat(chatStatus : boolean) {
    this._isInChat = chatStatus;
  }

  get conversationId() {
    return this._conversationId;
  }
  
  set conversationId(conversationId : string) {
    this._conversationId = conversationId;
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  checkConversationNameNotTaken(conversationName : string) {
    return this.http.get<Availability>(`${env.ROOT}${conversationPath}/check?name=${conversationName}`).pipe(catchError(this.userInfoService.handleError), map(data => data.conversationNameTaken));
  }

  saveConversationAndSendInvites(conversationName : string, invitedUsers : string[], dateCreated : string) {
    const payload = { conversationName, invitedUsers, dateCreated };
    return this.http.post(`${env.ROOT}${conversationPath}`, payload).pipe(catchError(this.userInfoService.handleError));
  }

  getConversations() {
    return this.http.get<{conversations : Conversation[]}>(`${env.ROOT}${conversationPath}`).pipe(catchError(this.userInfoService.handleError), map(data => data.conversations));
  }

  updateInChatStatus(conversationId : string, inChat : boolean) {
    const payload = { conversationId, inChatStatus : inChat };
    
    return this.http.put(`${env.ROOT}${conversationPath}/chatstatus`, payload).pipe(catchError(this.userInfoService.handleError), tap(() => {
      this.conversationId = inChat ? this.conversationId : "";
      this.isInChat = inChat ? this.isInChat : false;
    }));
  }

  updateInChatStatusAsPromise(conversationId : string, inChatStatus : boolean) {
    return new Promise<void>((resolve, reject) => {
      if (conversationId.length == 0) {
        resolve();
        return;
      }
      
     const subscription = this.updateInChatStatus(conversationId, inChatStatus).subscribe(() => resolve(), () => reject());
     this.subscriptions.push(subscription);
    });
  }

}