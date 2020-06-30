import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { env } from '../../environments/environment';
import { catchError, tap, map } from 'rxjs/operators';
import { UserInfoService } from './user-info.service';
import { CacheService } from './cache.service';
import { IconResponse, PicResponse } from '../interfaces';
import { UiService } from './ui.service';

const imagePath = 'image';

@Injectable({
  providedIn :  'root'
})
export class ImageService implements OnDestroy {

  subscriptions : Subscription[] = [];

  private _hasProfilePic : boolean;
  private  _pic : SafeUrl;
  private _base64 : string;
  private _mimeType : string;

  profilePicNotifier = new BehaviorSubject<string | undefined>(undefined);
  profilePicNotifier$ = this.profilePicNotifier.asObservable();
  
  constructor(private uiService : UiService, private http : HttpClient, private userInfoService : UserInfoService, private cache : CacheService, private sanitizer : DomSanitizer) { 
  }

  get hasProfilePic() {
    return this._hasProfilePic;
  }

  set hasProfilePic(hasProfilePic : boolean) {
    this._hasProfilePic = hasProfilePic;
  }

  get pic() {
    return this._pic;
  }

  set pic(src : SafeUrl) {
    this._pic = src;
  }

  get base64() {
    return this._base64;
  }

  set base64(base64 : string) {
    this._base64 = base64;
  }

  get mimeType() {
    return this._mimeType;
  }

  set mimeType(mimeType : string) {
    this._mimeType = mimeType;
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  getPic() {
    const subscribe = observer => {
      
      const subscription = this.hasPic().subscribe(data => {

        this.hasProfilePic = data.hasProfilePic;

        this.getUserPic(this.hasProfilePic, (err, src : string) => {
          if (!err && src) {
            this.pic = this.sanitize(src);
            observer.next(this.pic);
            observer.complete();
          }
          else {
            this.getDefaultPic((err, src : string) => {
              if (err) {
                observer.error(err);
                observer.complete();

                return;
              }
              
              this.pic = this.sanitize(src);
              observer.next(this.pic);
              observer.complete();
            });
          }
        });

      });

      this.subscriptions.push(subscription);
    }
    
    return new Observable<SafeUrl | HttpErrorResponse>(subscribe);
  }

  getIcons() {    
    const subscribe = observer => {
      if (this.cache.hasImage('icons')) {
        observer.next(this.cache.getImage('icons'));
        observer.complete();
        return;
      }
      const iconLookup = {};

      const subscription = this.http.get<IconResponse>(`${env.ROOT}${imagePath}/icons`).pipe(catchError(this.userInfoService.handleError))
      .subscribe(data => {
        const { byteArrBase64s, mimeType } = data;

        for (const iconName in byteArrBase64s) {
          iconLookup[iconName] = this.encodePic(byteArrBase64s[iconName], mimeType);
        }
        
        this.cache.putImage("icons", iconLookup);
        observer.next(iconLookup);
        observer.complete();
      });

      this.subscriptions.push(subscription);
    }

    return new Observable<Object | HttpErrorResponse>(subscribe);
  }

  getDefaultPic(doSomething : Function) {
    if (this.cache.hasImage('defaultpic')) {
      doSomething(null, this.cache.getImage('defaultpic'));
      return;
    }

    const subscription = this.http.get<PicResponse>(`${env.ROOT}${imagePath}/defaultpic`).pipe(catchError(this.userInfoService.handleError))
    .subscribe(data => {
      const { byteArrBase64, mimeType } = data;
      const src = this.encodePic(byteArrBase64, mimeType);
      
      this.base64 = byteArrBase64;
      this.mimeType = mimeType;

      this.cache.putImage('defaultpic', src);
      doSomething(null, src);
    }, 
    err => doSomething(err, null));

    this.subscriptions.push(subscription);
  }

  getUserPic(hasPic : boolean, doSomething : Function) {    
    if (!hasPic) {
      doSomething(null, null);
      return;
    }
    
    if (this.cache.hasImage('profilepic')) {
      doSomething(null, this.cache.getImage('profilepic'));
      return;
    }

    const subscription = this.http.get<PicResponse>(`${env.ROOT}${imagePath}/profilepic`).pipe(catchError(this.userInfoService.handleError))
    .subscribe(data => {
      const { byteArrBase64, mimeType } = data;
      const src = this.encodePic(byteArrBase64, mimeType);

      this.base64 = byteArrBase64;
      this.mimeType = mimeType;

      this.cache.putImage('profilepic', src);
      doSomething(null, src);
    }, 
    err => doSomething(err, null));

    this.subscriptions.push(subscription);
  }

  hasPic() {
    return this.http.get<{hasProfilePic : boolean}>(`${env.ROOT}${imagePath}/hasprofilepic`).pipe(catchError(this.userInfoService.handleError), map(data => data));
  }

  savePic(arrayBuffer : ArrayBuffer, mimeType : string) {
    const byteArrBase64 = this.getBase64String(arrayBuffer);
    const payload = { byteArrBase64, mimeType };

    return this.http.post(`${env.ROOT}${imagePath}/profilepic`, payload).pipe(catchError(this.userInfoService.handleError), tap(event => {
      const src = this.encodePic(byteArrBase64, mimeType);
      this.cache.putImage('profilepic', src);
    }));
  } 

  deletePic() {
    return this.http.delete(`${env.ROOT}${imagePath}/profilepic`).pipe(catchError(this.userInfoService.handleError), tap(event => {
      this.cache.clearImageCache();
    }));
  }

  encodePic(base64 : string, mimeType : string) {
    mimeType = this.formatMimeType(mimeType);
    const arrayBuffer = this.getArrayBuffer(base64);

    const newString = arrayBuffer.reduce((a, b) => { 
      return a + String.fromCharCode(b) 
    }
      , '');
      
    return `data:image/${mimeType};base64,` + btoa(newString).replace(/.{76}(?=.)/g,'$&\n');
  }

  sanitize(src : string) : SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(src);
  }

  /* image/jpeg || image/png */
  private formatMimeType(mimeType : string) {
    const A = mimeType.split('/');
    const n = A.length;

    if (n === 1) {
      return mimeType;
    }

    return A[n - 1] === 'jpeg' ? 'jpg' : A[n - 1];
  }

  private getArrayBuffer(base64 : string) {
    const binaryString = window.atob(base64);
    const n = binaryString.length;
    const bytes = new Uint8Array(n);

    for (let i = 0; i < n; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    } 

    return new Uint8Array(bytes.buffer);
  }

  private getBase64String(arrayBuffer : ArrayBuffer) {
    let binaryString = "";

    const bytes = new Uint8Array(arrayBuffer);
    const n = bytes.length;

    for (let i = 0; i < n; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binaryString);
  }

}
