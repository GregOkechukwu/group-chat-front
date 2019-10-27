import { Injectable } from '@angular/core';
import { HttpClient,  HttpErrorResponse } from '@angular/common/http';
import { root, RouteService } from './route.service';
import { catchError, map } from 'rxjs/operators';
import { throwError,  Subject } from 'rxjs'

export interface UserInfo {
  username : string;
  firstname? : string;
  lastname? : string;
  online? : boolean;
  hasProfilePic? : boolean;
  pic? : any | null;
}

interface UserInfoResponse {
  cacheable : boolean;
  result : UserInfo | UserInfo[];
}

export interface Availability {
  cacheable : boolean;
  isAvailable : boolean;
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

    return this.http.post<Availability>(url, {permitWithoutAuthHeader : true}).pipe(catchError(this.handleError), map(res => res.isAvailable));
  }

  getAllUsers(criteria? : string, value? : string) {
    if (!criteria || !value) {
      return this.http.get<UserInfoResponse>(`${root}users`).pipe(catchError(this.handleError), map(data => data.result));
    }

    return this.http.get<UserInfoResponse>(`${root}users?${criteria}=${value}`).pipe(catchError(this.handleError), map(data => data.result));
  }

  getUserInfo() { 
    return this.http.get<UserInfoResponse>(`${root}user`).pipe(catchError(this.handleError), map(data => data.result));
  }

  getAllFriends(criteria? : string, value? : string) {
    if (!criteria || !value) {
      return this.http.get<UserInfoResponse>(`${root}friends`).pipe(catchError(this.handleError), map(data => data.result));
    }
    return this.http.get<UserInfoResponse>(`${root}friends?${criteria}=${value}`).pipe(catchError(this.handleError), map(data => data.result));
  }

  updateUserInfo(payload) {
    return this.http.post(`${root}updateuser`, payload).pipe(catchError(this.handleError));
  }


  formatFullName(first : string, last : string, username : string) {    
    let newFirst = this.formatFirstOrLast(first);
    let newLast = this.formatFirstOrLast(last);
    let newDisplay = this.formatUsername(username);
    return [newFirst, newLast, newDisplay];
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
