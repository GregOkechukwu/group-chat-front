import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../../environments/environment';
import { UserInfoService } from './user-info.service';
import { Invite } from '../interfaces';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

const invitePath = 'invite';

@Injectable({
  providedIn: 'root'
})
export class InviteInfoService {

  inviteCountNotfier = new BehaviorSubject<number>(-1);
  inviteCountNotfier$ = this.inviteCountNotfier.asObservable();

  constructor(private http : HttpClient, private userInfoService : UserInfoService) { }

  getReceivedInvitesCount() {
    return this.http.get<{inviteCount : number}>(`${env.ROOT}${invitePath}/count`).pipe(catchError(this.userInfoService.handleError), map(data => data.inviteCount));
  } 

  getReceivedInvites() {
    return this.http.get<{invites : Invite[]}>(`${env.ROOT}${invitePath}/received`).pipe(catchError(this.userInfoService.handleError), map(data => data.invites));
  } 

  getSentInvites() {
    return this.http.get<{invites : Invite[]}>(`${env.ROOT}${invitePath}/sent`).pipe(catchError(this.userInfoService.handleError), map(data => data.invites));
  }  
  
  acceptInvite(inviteId : string, conversationId : string, dateJoined : string) {
    return this.http.delete(`${env.ROOT}${invitePath}/accept?inviteId=${inviteId}&conversationId=${conversationId}&dateJoined=${dateJoined}`).pipe(catchError(this.userInfoService.handleError));
  }

  declineInvite(inviteId : string) {
    return this.http.delete(`${env.ROOT}${invitePath}/decline?inviteId=${inviteId}`).pipe(catchError(this.userInfoService.handleError)); 
  }

  cancelInvite(inviteId : string) {
    return this.http.delete(`${env.ROOT}${invitePath}/cancel?inviteId=${inviteId}`).pipe(catchError(this.userInfoService.handleError)); 
  }

}
