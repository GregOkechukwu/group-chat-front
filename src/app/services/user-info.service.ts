import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient,  HttpErrorResponse } from '@angular/common/http';
import { env } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { throwError, BehaviorSubject, Subscription } from 'rxjs'
import { CurrentUser, SearchedUser, Availability, ChatUser } from '../interfaces';
import { UiService } from './ui.service';

const adminUserPath = 'admin/user';
const userPath = 'user';

@Injectable({
  providedIn :  'root'
})
export class UserInfoService implements OnDestroy {
  subscriptions : Subscription[] = [];

  profileUpdateNotifier = new BehaviorSubject<CurrentUser>(undefined);
  profileUpdateNotifier$ = this.profileUpdateNotifier.asObservable();

  constructor(private http : HttpClient, private uiService : UiService) { }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  handleError(err : HttpErrorResponse) {
    console.log(err);
    return throwError(err);
  }

  checkPassword(password : string) {
    const payload = { password };
    return this.http.post(`${env.ROOT}${userPath}/password`, payload).pipe(catchError(this.handleError));
  }

  deleteUser(userId : string) {
    return this.http.delete(`${env.ROOT}${adminUserPath}/delete?userId=${userId}`).pipe(catchError(this.handleError));
  }

  saveUser(username : string, firstName : string, lastName : string, email : string, dateCreated : string) {
    const payload = {username, firstName, lastName, email, dateCreated};
    return this.http.post(`${env.ROOT}${userPath}`, payload).pipe(catchError(this.handleError));
  }

  getUser() { 
    return this.http.get<CurrentUser>(`${env.ROOT}${userPath}`).pipe(catchError(this.handleError), map(user => user));
  }

  getUsers(username : string, firstName : string, lastName : string, includeFriends : boolean = true) {
    const includeFriendsQuery = includeFriends ? '?includefriends=true' : '?includefriends=false';
    const userAttributeQuery = username != "" ? `&username=${username}` : firstName != "" ? `&firstname=${firstName}` : lastName != "" ? `&lastname=${lastName}` : "";
    return this.http.get<{users : SearchedUser[]}>(`${env.ROOT}${userPath}/users${includeFriendsQuery}${userAttributeQuery}`).pipe(catchError(this.handleError), map(data => data.users));
  }

  getFriends(username : string, firstName : string, lastName : string) {
    const userAttributeQuery = username != "" ? `?username=${username}` : firstName != "" ? `?firstname=${firstName}` : lastName != "" ? `?lastname=${lastName}` : "";
    return this.http.get<{friends : SearchedUser[]}>(`${env.ROOT}${userPath}/friends${userAttributeQuery}`).pipe(catchError(this.handleError), map(data => data.friends));
  }

  removeFriend(friendId : string) {
    return this.http.delete(`${env.ROOT}${userPath}/friend?friendId=${friendId}`).pipe(catchError(this.handleError));
  }

  getUsersInConversation(conversationId : string) {
    return this.http.get<{conversationMembers : ChatUser[]}>(`${env.ROOT}${userPath}/conversation/${conversationId}`).pipe(catchError(this.handleError), map(data => data.conversationMembers));
  }

  getUsersInConversationAsPromise(conversationId : string) {
    return new Promise<ChatUser[]>((resolve, reject) => {
      const subscription = this.getUsersInConversation(conversationId).subscribe((conversationMembers : ChatUser[]) => resolve(conversationMembers), (err : any) => reject(err));
      this.subscriptions.push(subscription);
    });
  }

  updateUser(username : string, firstName : string, lastName : string, email : string, password : string) {
    const isEmpty = str => str === undefined || str === null || str === "";
    const payload : {username? : string, firstName? : string, lastName? : string, email? : string, password : string} = { password };

    if (!isEmpty(username)) payload.username = username;
    if (!isEmpty(firstName)) payload.firstName = firstName;
    if (!isEmpty(lastName)) payload.lastName = lastName;
    if (!isEmpty(email)) payload.email = email;

    return this.http.put(`${env.ROOT}${userPath}`, payload).pipe(catchError(this.handleError));
  }

  updateOnlineStatus(isOnline : boolean) {
    const payload = { isOnline };
    return this.http.put(`${env.ROOT}${userPath}/onlinestatus`, payload).pipe(catchError(this.handleError));
  }

  updateOnlineStatusAsPromise(isOnline : boolean) {
    return new Promise<void>((resolve, reject) => {
      const subscription = this.updateOnlineStatus(isOnline).subscribe(() => resolve(), (err : any) => reject(err));
      this.subscriptions.push(subscription);
    });
  }

  checkUsernameNotTaken(username : string) {
    return this.http.get<{usernameTaken : boolean}>(`${env.ROOT}${adminUserPath}/check?username=${username}`).pipe(catchError(this.handleError), map(data => data.usernameTaken));
  }

  checkEmailNotTaken(email : string) {
    return this.http.get<Availability>(`${env.ROOT}${adminUserPath}/check?email=${email}`).pipe(catchError(this.handleError), map(data => data.emailTaken));
  }

  checkUsernameAndEmailNotTaken(username : string, email : string) {
    return this.http.get<Availability>(`${env.ROOT}${adminUserPath}/check?username=${username}&email=${email}`).pipe(catchError(this.handleError), map(data => data));
  }

}
