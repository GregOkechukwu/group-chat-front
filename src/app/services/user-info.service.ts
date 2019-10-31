import { Injectable } from '@angular/core';
import { HttpClient,  HttpErrorResponse } from '@angular/common/http';
import { root, RouteService } from './route.service';
import { catchError, map } from 'rxjs/operators';
import { throwError,  Subject } from 'rxjs'
import { Conversation } from './conversation-info.service';

export interface UserInfo {
  username : string;
  firstname? : string;
  lastname? : string;
  online? : boolean;
  hasProfilePic? : boolean;
  pic? : any | null;
}

export interface Availability {
  isAvailable : boolean;
}

export interface Invite {
  date_sent : string;
  conversation : Conversation
  sender : UserInfo
}

interface RawEntityPayload {
  raw : any | any[];
  entities : UserInfo | UserInfo[]
}

interface Response {
  cacheable : boolean;
  result : UserInfo[] | Availability | RawEntityPayload | Invite[] 
}

@Injectable({
  providedIn :  'root'
})
export class UserInfoService {
  profileInfoNotifier = new Subject<any>();
  profileInfoNotifier$ = this.profileInfoNotifier.asObservable();

  constructor(private http : HttpClient, private routeService : RouteService) { }

  handleError(err : HttpErrorResponse) {
    console.log(err);
    return throwError(err);
  }

  checkAvailability(criteria, value) {
    const url = `${root}user/check?${criteria}=${value}`;
    this.routeService.blackListTrie.addWord(url);

    return this.http.post<Response>(url, {permitWithoutAuthHeader : true}).pipe(catchError(this.handleError), map(res => (<Availability>res.result).isAvailable));
  }

  getUsers(criteria? : string, value? : string) {
    if (!criteria || !value) {
      return this.http.get<Response>(`${root}users`).pipe(catchError(this.handleError), map(data => <UserInfo[]>data.result));
    }

    return this.http.get<Response>(`${root}users?${criteria}=${value}`).pipe(catchError(this.handleError), map(data => <UserInfo[]>data.result));
  }

  getFriends(criteria? : string, value? : string) {
    if (!criteria || !value) {
      return this.http.get<Response>(`${root}friends`).pipe(catchError(this.handleError), map(data => <UserInfo[]>data.result));
    }
    return this.http.get<Response>(`${root}friends?${criteria}=${value}`).pipe(catchError(this.handleError), map(data => <UserInfo[]>data.result));
  }

  getUserInfo() { 
    return this.http.get<Response>(`${root}user`).pipe(catchError(this.handleError), map(data => {
      data.result = <RawEntityPayload>data.result;

      let result = {
        ...data.result.entities[0], 
        invitecount : data.result.raw[0].invite_count
      }

      return result;
    }));
  }

  updateUserInfo(payload) {
    return this.http.post(`${root}updateuser`, payload).pipe(catchError(this.handleError));
  }

  getInvites() {
    return this.http.get<Response>(`${root}invites`).pipe(catchError(this.handleError), map(data => <Invite[]>data.result));
  }

  formatFullname(first : string, last : string, username : string) {    
    let newFirst = this.formatFirstOrLast(first);
    let newLast = this.formatFirstOrLast(last);
    let newUsername = this.formatUsername(username);
    return [newFirst, newLast, newUsername];
  }

  formatFirstOrLast(name : string) {
    return name[0].toUpperCase() + name.slice(1).toLowerCase();
  }

  formatUsername(username : string) {
    return username.toLowerCase();
  }

  getInitials(first : string, last : string) {
    return first[0].toUpperCase() + last[0].toUpperCase();
  }

}
