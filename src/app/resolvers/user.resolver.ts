import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from '@angular/core';
import { UserInfoService, UserInfo } from '../services/user-info.service';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from '../services/auth.service';


@Injectable()
export class UserResolver implements  Resolve<Object> {
    constructor(private userInfoService : UserInfoService, private authService : AuthService) { }

    resolve(route : ActivatedRouteSnapshot,  state : RouterStateSnapshot) : Observable<UserInfo> {
        let subscribe = observer => {
            this.authService.refreshTemporaryCred(err => {
                if (err) {
                    observer.error(err);
                } else {
                    this.userInfoService.getUserInfo()
                    .subscribe((data : UserInfo) => observer.next(data), err => observer.error(err), () => observer.complete());
                }
            })
        }
        return new Observable<UserInfo>(subscribe);
    }

}