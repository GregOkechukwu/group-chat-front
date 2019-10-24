import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RouteService } from '../services/route.service'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authService : AuthService, private routeService : RouteService) {}

    intercept(req : HttpRequest<any>, next : HttpHandler) : Observable<HttpEvent<any>> {
        if (this.avoidRoute(req.urlWithParams)) {
            return next.handle(req);
        }

        let currentUser = this.authService.getCurrentUser().getUsername();
        let accessTokenKey = `CognitoIdentityServiceProvider.${this.authService.appClientId}.${currentUser}.accessToken`; 
        let token = localStorage.getItem(accessTokenKey);

        if (token) {
            const authReq = req.clone({
                headers: new HttpHeaders({
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${token}`
                })
            });
            return next.handle(authReq);
        }
        return next.handle(req);
    }

    avoidRoute(route) {
        return this.routeService.blackListTrie.foundWord(route);
    }
}


