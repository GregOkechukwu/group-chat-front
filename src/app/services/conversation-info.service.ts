import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { root } from './route.service';
import { catchError, map } from 'rxjs/operators';
import { UserInfoService, Availability } from './user-info.service';

@Injectable({
  providedIn: 'root'
})
export class ConversationInfoService {

  constructor(private http : HttpClient, private userInfoService : UserInfoService) { }

  createConversation(payload : Object) {
    return this.http.post(`${root}conversation`, payload).pipe(catchError(this.userInfoService.handleError));
  }

  checkAvailability(criteria : string, value : string) {
    const url = `${root}conversation/check?${criteria}=${value}`;
    return this.http.get<Availability>(url).pipe(catchError(this.userInfoService.handleError), map(res => res.isAvailable));
  }
}
