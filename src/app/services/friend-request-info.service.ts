import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../../environments/environment';
import { UserInfoService } from './user-info.service';
import { catchError, map } from 'rxjs/operators';
import { FriendRequest } from '../interfaces';

const friendRequestPath = 'friendrequest';

@Injectable({
  providedIn: 'root'
})
export class FriendRequestInfoService {

  constructor(private http : HttpClient, private userInfoService : UserInfoService) { }

  sendFriendRequests(usersToAdd : string[], dateSent : string ) {
    const payload = { usersToAdd, dateSent };
    return this.http.post(`${env.ROOT}${friendRequestPath}`, payload).pipe(catchError(this.userInfoService.handleError));
  }

  getReceivedFriendRequests() {
    return this.http.get<{friendRequests : FriendRequest[]}>(`${env.ROOT}${friendRequestPath}/received`).pipe(catchError(this.userInfoService.handleError), map(data => data.friendRequests));
  }

  getSentFriendRequests() {
    return this.http.get<{friendRequests : FriendRequest[]}>(`${env.ROOT}${friendRequestPath}/sent`).pipe(catchError(this.userInfoService.handleError), map(data => data.friendRequests));
  }

  acceptFriendRequest(friendRequestId : string, senderId : string, dateAdded : string) {
    return this.http.delete(`${env.ROOT}${friendRequestPath}/accept?friendRequestId=${friendRequestId}&senderId=${senderId}&dateAdded=${dateAdded}`).pipe(catchError(this.userInfoService.handleError));   
  }

  declineFriendRequest(friendRequestId : string) {
    return this.http.delete(`${env.ROOT}${friendRequestPath}/decline?friendRequestId=${friendRequestId}`).pipe(catchError(this.userInfoService.handleError));   
  }

  cancelFriendRequest(friendRequestId : string) {
    return this.http.delete(`${env.ROOT}${friendRequestPath}/cancel?friendRequestId=${friendRequestId}`).pipe(catchError(this.userInfoService.handleError));   
  }

}
