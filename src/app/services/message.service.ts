import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { UserInfoService } from './user-info.service';
import { UserMessage } from '../interfaces';
import { Subscription } from 'rxjs/internal/Subscription';
import { UiService } from './ui.service';

const messagePath = 'message';

@Injectable({
  providedIn: 'root'
})
export class MessageService implements OnDestroy {

  subscriptions : Subscription[] = [];

  constructor(private http : HttpClient, private userInfoService : UserInfoService, private uiService : UiService) { }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  createMessage(conversationId : string, messageContent : string, dateSent : string) {
    const payload = { 
      conversationId,
      message : {
        messageContent,
        dateSent
      }
    }

    return this.http.post<{messageId : string}>(`${env.ROOT}${messagePath}`, payload).pipe(catchError(this.userInfoService.handleError), map(data => data.messageId));
  }

  getUserMessages(conversationId : string) {
    return this.http.get<{userMessages : UserMessage[]}>(`${env.ROOT}${messagePath}/${conversationId}`).pipe(catchError(this.userInfoService.handleError), map(data => data.userMessages));
  }

  getUserMessagesAsPromise(conversationId : string) {
    return new Promise<UserMessage[]>((resolve, reject) => {
      const subscription = this.getUserMessages(conversationId).subscribe((userMessages : UserMessage[]) => resolve(userMessages), (err : any) => reject(err));
      this.subscriptions.push(subscription);
    });
  }
}
