import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { root } from './route.service';
import { catchError, map } from 'rxjs/operators';
import { UserInfoService, Availability, UserInfo } from './user-info.service';

export interface Conversation {
  name : string
  host? : UserInfo
  users? : UserInfo[]
}

interface Response {
  cacheable : boolean;
  result : Conversation[]
}

@Injectable({
  providedIn: 'root'
})
export class ConversationInfoService {
  constructor(private http : HttpClient, private userInfoService : UserInfoService) { }

  getConversations() {
    return this.http.get<Response>(`${root}conversations`).pipe(catchError(this.userInfoService.handleError), map(res => <Conversation[]>res.result));
  }

  createConversation(payload : Object) {
    return this.http.post(`${root}conversation`, payload).pipe(catchError(this.userInfoService.handleError));
  }

  checkAvailability(criteria : string, value : string) {
    const url = `${root}conversation/check?${criteria}=${value}`;
    return this.http.get<Availability>(url).pipe(catchError(this.userInfoService.handleError), map(res => res.isAvailable));
  }
}
