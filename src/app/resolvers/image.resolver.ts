import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ImageService } from '../services/image.service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { UserInfoService } from '../services/user-info.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Injectable()
export class ImageResolver implements  Resolve<Object> {
    constructor(private imageService : ImageService, private userInfoService : UserInfoService) {}

    resolve(route : ActivatedRouteSnapshot,  state : RouterStateSnapshot) : Observable<any> {
        return forkJoin(
            this.imageService.getPic().pipe(catchError(this.userInfoService.handleError)),
            this.imageService.getIcons().pipe(catchError(this.userInfoService.handleError))
        );
    }
}