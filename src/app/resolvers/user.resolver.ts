import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from '@angular/core';
import { UserInfoService } from '../services/user-info.service';
import { Observable } from 'rxjs/internal/Observable';
import { CurrentUser } from '../interfaces';

@Injectable()
export class UserResolver implements  Resolve<Object> {
    constructor(private userInfoService : UserInfoService) { }

    resolve(route : ActivatedRouteSnapshot,  state : RouterStateSnapshot) : Observable<CurrentUser> {
        const subscribe = observer => {
            this.userInfoService.getUser()  
            .subscribe((user : CurrentUser) => observer.next(user), err => observer.error(err), () => observer.complete());
        }
        return new Observable<CurrentUser>(subscribe);
    }
}



