import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {

  constructor(public router:Router, public authService:AuthService) { }

  canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot){return false;}

}
