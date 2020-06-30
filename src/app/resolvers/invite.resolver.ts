import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CurrentUser } from '../interfaces';
import { InviteInfoService } from '../services/invite-info.service';

@Injectable()
export class InviteResolver implements  Resolve<Object> { 

  constructor(private inviteInfoService : InviteInfoService) { }

  resolve(route : ActivatedRouteSnapshot,  state : RouterStateSnapshot) : Observable<number> {
    return this.inviteInfoService.getReceivedInvitesCount();
  }
}
