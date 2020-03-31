import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { env } from '../../environments/environment';
import { UserInfoService } from './user-info.service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map } from 'rxjs/internal/operators/map';
import { RegisterUserInfo } from '../interfaces';

const adminRegisterPath = "admin/register";


@Injectable({
  providedIn :  'root'
})
export class RegisterService {
  constructor(private http : HttpClient, private userInfo : UserInfoService) {}

  initiateRegistration(username : string, email : string, firstName : string, lastName : string) {
    const payload = {username, email, firstName, lastName};
    return this.http.post<RegisterUserInfo>(`${env.ROOT}${adminRegisterPath}`, payload).pipe(catchError(this.userInfo.handleError), map(data => data));
  }

  cancelRegistration(username : string) {
    return this.userInfo.deleteUser(username);
  }
}


