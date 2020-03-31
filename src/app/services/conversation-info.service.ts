import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { UserInfoService } from './user-info.service';
import { Availability, Conversation } from '../interfaces';

const conversationPath = 'conversation';

@Injectable({
  providedIn: 'root'
})
export class ConversationInfoService {
  constructor(private http : HttpClient, private userInfoService : UserInfoService) { }

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

}
