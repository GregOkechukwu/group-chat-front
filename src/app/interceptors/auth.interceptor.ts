import { Injectable, OnDestroy } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpHeaders, HttpResponse} from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { tap } from 'rxjs/internal/operators/tap';
import { Observable } from 'rxjs/internal/Observable';
import { UserInfoService } from '../services/user-info.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Injectable()
export class AuthInterceptor implements HttpInterceptor, OnDestroy {
    subscriptions : Subscription[];

    constructor(private authService : AuthService, private userInfoService : UserInfoService) {}

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            if (subscription instanceof Subscription) {
                subscription.unsubscribe();
            }
        }
    }

    intercept(request : HttpRequest<any>, next : HttpHandler) : Observable<HttpEvent<any>> {
        const updateOne = {
            headers: new HttpHeaders({
                'Content-Type':'application/json'
            })
        }

        const updateTwo = {
            withCredentials : true
        }

        request = request.clone(updateOne).clone(updateTwo);  

        return next.handle(request).pipe(tap(event => {
            if (event instanceof HttpResponse && this.authService.hasLoggedIn && event.status === 401) {
                const isOnline = false;
                const subscription = this.userInfoService.updateOnlineStatus(isOnline).subscribe(() => this.authService.kickout());
                this.subscriptions.push(subscription);
            }
        }));
    }
}


 