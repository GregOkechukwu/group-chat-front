import { Injectable, OnDestroy } from '@angular/core';
import * as  AmazonCognitoIdentity from "amazon-cognito-identity-js";
import { HttpClient } from '@angular/common/http';
import { UserInfoService } from './user-info.service';
import { Router } from '@angular/router';
import { env } from '../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { ImageService } from './image.service';
import { CacheService } from './cache.service';
import { UiService } from './ui.service';
import { Subscription } from 'rxjs';

export { AmazonCognitoIdentity };

const adminLoginPath = 'admin/login';
const adminUserPath = 'admin/user';
const userPath = "user";

@Injectable({ 
  providedIn : 'root'
})
export class AuthService implements OnDestroy {
  subscriptions : Subscription[] = [];

  private _hasLoggedIn : boolean = false;

  constructor(
    private router : Router, 
    private http : HttpClient, 
    private userInfo : UserInfoService, 
    private cache : CacheService,
    private uiService : UiService
  ) { }

  get hasLoggedIn() {
    return this._hasLoggedIn;
  }

  set hasLoggedIn(loginStatus : boolean) {
    this._hasLoggedIn = loginStatus;
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  firstLogin(username : string, newPassword : string, tempPassword : string) {
    const payload = {usernameOrEmail : username, newPassword, tempPassword};
    return this.http.post(`${env.ROOT}${adminLoginPath}/firstlogin`, payload).pipe(catchError(this.userInfo.handleError));
  }

  login(usernameOrEmail : string, password : string) {
    const payload = {usernameOrEmail, password};
    return this.http.post(`${env.ROOT}${adminLoginPath}`, payload).pipe(catchError(this.userInfo.handleError));
  }

  signOut() {
    return this.http.get(`${env.ROOT}${userPath}/logout`).pipe(catchError(this.userInfo.handleError), tap(() => {
      this.hasLoggedIn = false;
      this.cache.clearCache();
    }));
  }

  signOutAsPromise() {
    return new Promise<void>((resolve, reject) => {
      const subscription = this.signOut().subscribe(() => resolve(), (err : any) => reject(err));
      this.subscriptions.push(subscription);
    });
  }

  sendVerificationCode(username : string) {
    return this.http.get<{emailDestination : string}>(`${env.ROOT}${adminLoginPath}/send?username=${username}`).pipe(catchError(this.userInfo.handleError), map(data => data.emailDestination));
  }

  validateCodeAndUpdatePassword(username : string, code : string, newPassword : string) {
    const payload = {username, code, newPassword};
    return this.http.put(`${env.ROOT}${adminLoginPath}/forgot`, payload).pipe(catchError(this.userInfo.handleError));  
  }

  getAuthenticationStatus() {
    return this.http.get<{isAuthenticated : boolean}>(`${env.ROOT}${adminUserPath}/authstatus`).pipe(catchError(this.userInfo.handleError), map(data => data.isAuthenticated));
  }

  kickout() {
    this.uiService.hasUsedResolver = false;
    this.router.navigate(['/login']);
  }

  goBackHome() {
    this.router.navigate(['/home']);
  }
  
} 



