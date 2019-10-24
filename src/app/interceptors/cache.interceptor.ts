import { Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { CacheService } from '../services/cache.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
    constructor(private cache : CacheService) {}

    intercept(req : HttpRequest<any>, next : HttpHandler) {
        let res = this.cache.getResponse(req);
        let result =  res ? of(res) : this.sendRequest(req, next)
        return result;
    }   

    sendRequest(req : HttpRequest<any>, next : HttpHandler) {
        return next.handle(req).pipe(tap(event => {
            if (event instanceof HttpResponse) {
                this.cache.putResponse(req, event);
            }
        }));
    }
}