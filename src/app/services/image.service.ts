import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, BehaviorSubject } from 'rxjs';
import { root } from './route.service';
import { catchError, tap, map } from 'rxjs/operators';
import { UserInfoService } from './user-info.service';
import { AuthService } from './auth.service';
import { S3, AWSError } from 'aws-sdk';
import { GetObjectRequest } from 'aws-sdk/clients/s3';
import { CacheService } from './cache.service';
import { environment } from '../../environments/environment';

interface PicInfo {
  username : string;
  hasProfilePic : boolean;
}

interface PicInfoResponse {
  cacheable : boolean;
  result : PicInfo
}

@Injectable({
  providedIn :  'root'
})
export class ImageService {
  bucketName = environment.BUCKET_NAME;
  pathProfilePicPrefix = environment.PATH_PROFILE_PICS_PREFIX;
  pathIconPrefix = environment.PATH_ICONS_PREFIX;

  s3 = new S3();

  hasProfilePic : boolean;
  pic : SafeUrl;
  profilePicNotifier : BehaviorSubject<string | undefined>;
  profilePicNotifier$ : Observable<string | undefined>;
  
  constructor(private http : HttpClient, private userInfoService : UserInfoService, private authService : AuthService, private cache : CacheService, private sanitizer : DomSanitizer) { 
    this.profilePicNotifier = new BehaviorSubject<string | undefined>(undefined);
    this.profilePicNotifier$ = this.profilePicNotifier.asObservable();
  }

  getPic() {

    let subscribe = observer => {
      this.authService.refreshTemporaryCred(err => {
        if (err) return;

        this.hasPic().subscribe(data => {
          this.pic = undefined;
          this.hasProfilePic = data.hasProfilePic;

          this.getUserPic(data.username, this.hasProfilePic, this.cache, (err, data) => {
            if (!err && data) {
              this.pic = this.sanitize(data);
              observer.next(this.pic);
            }
            this.getDefaultPic(this.cache, (err, data) => {
              if (err) observer.error(err);
              else {
                data = this.sanitize(data);
                if (this.pic === undefined) {
                  this.pic = data;
                  observer.next(this.pic);
                }
              }
              observer.complete();
            });
          });

        }, err => {
          console.log(err);
          observer.error(err);
        });       
      });
    }
    return new Observable<SafeUrl | AWSError>(subscribe);
  }

  getDefaultPic(cache : CacheService, callback : Function) {
    if (cache.hasImage('defaultpic')) {
      callback(null, cache.getImage('defaultpic'));
      return;
    }
    const params : GetObjectRequest = {
      Bucket : this.bucketName,
      Key : `${this.pathProfilePicPrefix}/default`
    }

    this.s3.getObject(params, (err, img) => {
      if (err) {
        callback(err, null);
      } else {
        let src = this.encodePic(img.Body, img.ContentType);
        cache.putImage('defaultpic', src);
        callback(null, src);
      }
    });
  }

  getUserPic(username : string, hasPic : boolean, cache : CacheService, callback : Function) {
    if (!hasPic) {
      callback(null, null);
      return;
    } else if (cache.hasImage('profilepic')) {
      callback(null, cache.getImage('profilepic'));
      return;
    }

    const params : GetObjectRequest = {
      Bucket : this.bucketName,
      Key : `${this.pathProfilePicPrefix}/${username}`
    }
    this.s3.getObject(params, (err, img) => {
      if (err) {
        console.log(err)
        callback(err, null);
      }
      else {
        console.log(img);
        const src = this.encodePic(img.Body, img.ContentType)
        cache.putImage('profilepic', src);
        callback(null, src)
      }
    });
  }

  getIcons() {
    let iconNames = environment.ICON_NAMES;
    let n = iconNames.length, emitCount = 0;
    
    let subscribe = observer => {
      if (this.cache.hasImage('icons')) {
        observer.next(this.cache.getImage('icons'));
        observer.complete();
        return;
      }
      let iconLookup = {}

      for (let i = 0; i < n; i++) { 
        const param = {
          Bucket : this.bucketName,
          Key : `${this.pathIconPrefix}/${iconNames[i]}`
        }
        this.s3.getObject(param, (err, img) => {
          if (err) {
            observer.error(err);
            observer.complete();
          } else {
            const src = this.encodePic(img.Body, img.ContentType);
            iconLookup[iconNames[i]] = src;
            emitCount++;

            if (emitCount === n) {
              observer.next(iconLookup);
              this.cache.putImage('icons', iconLookup);
              observer.complete();
            }
          }
        });
      } 
    }

    return new Observable<Object | AWSError>(subscribe);
  }

  hasPic() {
    return this.http.get<PicInfoResponse>(`${root}hasprofilepic`).pipe(catchError(this.userInfoService.handleError), map(data => data.result));
  }

  savePic(src : string, mimeType : string) {
    const payload = {src, mimeType};
    return this.http.post(`${root}profilepic`, payload).pipe(catchError(this.userInfoService.handleError), tap(event => {
      this.cache.putImage('profilepic', src);
    }));
  } 

  deletePic() {
    return this.http.delete(`${root}profilepic`).pipe(catchError(this.userInfoService.handleError), tap(event => {
      this.cache.clearImageCache();
    }));
  }

  encodePic(data, mimeType : string) {
    mimeType = this.formatMime(mimeType);
    var S = data.reduce(function(a, b) { 
      return a + String.fromCharCode(b) 
    }
      , '');
    return `data:image/${mimeType};base64,` + btoa(S).replace(/.{76}(?=.)/g,'$&\n');
  }

  sanitize(src : string) : SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(src);
  }

  formatMime(mimeType : string) {
    let A = mimeType.split('/');
    let n = A.length;
    return A[n - 1] === 'jpeg' ? 'jpg' : A[n - 1]
  }



}
