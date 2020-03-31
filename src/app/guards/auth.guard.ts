import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuardForHome implements CanActivate {
    
  constructor(public authService: AuthService, public router: Router) {
  }

  canActivate() {
    const executor = (resolve, reject) => {
      this.authService.getAuthenticationStatus().subscribe(isAuthenticated => {
        console.log("isAuthenticated : ", isAuthenticated);
        if (!isAuthenticated) {
            resolve(false);
            this.authService.kickout();
        } else {
            resolve(true);
        }
      });
    }

    return new Promise<boolean>(executor);
  }

}

@Injectable()
export class AuthGuardForLoginRegister implements CanActivate {
    
  constructor(public authService: AuthService, public router: Router) {
  }

  canActivate() {
    const executor = (resolve, reject) => {
      this.authService.getAuthenticationStatus().subscribe(isAuthenticated => {
        console.log("isAuthenticated : ", isAuthenticated);
        if (!isAuthenticated) {
            resolve(true);
        } else {
            resolve(false);
            this.authService.goBackHome();
        }
      });
    }

    return new Promise<boolean>(executor);
  }
  
}