import { Injectable, OnDestroy } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserInfoService } from '../services/user-info.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { UiService } from '../services/ui.service';

@Injectable()
export class AuthGuardForHome implements CanActivate, OnDestroy {
  subscriptions : Subscription[] = [];
  
  constructor(
    private authService: AuthService, 
    private userInfoService : UserInfoService, 
    private uiService : UiService
  ) {
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  canActivate() {
    const executor = (resolve, reject) => {
      const subscriptionOne = this.authService.getAuthenticationStatus().subscribe(isAuthenticated => {
        console.log("isAuthenticated : ", isAuthenticated);

        if (!isAuthenticated) {
            resolve(false);
            this.authService.kickout();
        } 
        else {
          const isOnline = true;
          const subscriptionTwo = this.userInfoService.updateOnlineStatus(isOnline).subscribe(() => resolve(true), err => reject(err));

          this.subscriptions.push(subscriptionTwo);
        }
      });

      this.subscriptions.push(subscriptionOne);
    }

    return new Promise<boolean>(executor);
  }

}

@Injectable()
export class AuthGuardForLoginRegister implements CanActivate, OnDestroy {
  subscriptions : Subscription[] = [];
    
  constructor(private authService: AuthService, private uiService : UiService) {
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  canActivate() {
    const executor = (resolve, reject) => {
      const subscription = this.authService.getAuthenticationStatus().subscribe(isAuthenticated => {
        console.log("isAuthenticated : ", isAuthenticated);

        if (!isAuthenticated) {
            resolve(true);
        } 
        else {
            resolve(false);
            this.authService.goBackHome();
        }
      });

      this.subscriptions.push(subscription);
    }

    return new Promise<boolean>(executor);
  }
  
}