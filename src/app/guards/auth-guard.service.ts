import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService} from '../services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn : 'root'
})
export class AuthGuardService implements CanActivate {
  jwtHelper : JwtHelperService;

  constructor(private router : Router, private authService : AuthService) {
    this.jwtHelper = new JwtHelperService();
  }

  async canActivate(route : ActivatedRouteSnapshot, state : RouterStateSnapshot ) {

    const executor = (resolve, reject) => {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) reject();

      currentUser.getSession((err, session) => { 
        if (err) reject()
        else {
          if (this.jwtHelper.isTokenExpired(session.accessToken.jwtToken)) reject();
          else resolve(true);
        } 
      });
    }

    try {
      var validUser = await new Promise<boolean>(executor);
    } catch (err) {
      this.denyAccess();
    }
    return validUser;
  }

  denyAccess() {
    let reload = false;
    this.authService.kickout(reload);
    this.router.navigate(['/login'])
  }
}


