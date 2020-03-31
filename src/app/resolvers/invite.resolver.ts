import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CurrentUser } from '../interfaces';
import { InviteInfoService } from '../services/invite-info.service';

@Injectable()
export class InviteResolver implements  Resolve<Object> { 

  constructor(private inviteInfoService : InviteInfoService) { }

  resolve(route : ActivatedRouteSnapshot,  state : RouterStateSnapshot) : Observable<CurrentUser> {
    const subscribe = observer => {
        this.inviteInfoService.getReceivedInvitesCount()  
        .subscribe((inviteCount : number) => observer.next(inviteCount), err => observer.error(err), () => observer.complete());
    }

    return new Observable<CurrentUser>(subscribe);
  }
}
