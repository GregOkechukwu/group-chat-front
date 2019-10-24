import { Injectable } from '@angular/core';
import * as  AmazonCognitoIdentity from "amazon-cognito-identity-js";
import { config,  CognitoIdentityCredentials } from 'aws-sdk'
import { CacheService } from './cache.service';
import { HttpClient } from '@angular/common/http';
import { root } from './route.service';
import { UserInfoService } from './user-info.service';
import { environment } from '../../environments/environment'

export { AmazonCognitoIdentity };

@Injectable({
  providedIn :  'root'
})
export class AuthService {
  region = environment.REGION;
  appClientId = environment.APP_CLIENT_ID;
  userPoolId = this.region + environment.USER_POOL_ID_SUFFIX;
  identityPoolId  = this.region + environment.IDENTIY_POOL_ID_SUFFIX
  idpLoginUrl  = `cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}`;

  temporaryCred : CognitoIdentityCredentials;
  currentUser : AmazonCognitoIdentity.CognitoUser;
  userPool = new AmazonCognitoIdentity.CognitoUserPool({UserPoolId : this.userPoolId , ClientId : this.appClientId});

  constructor(private http : HttpClient, private cache : CacheService, private userInfo : UserInfoService) { }

  forgotPassword(username,  callback) {
    const cognitoUser = this.getCognitoUser(username, this.userPool);
    cognitoUser.forgotPassword({
      onSuccess : result => callback(null, result), 
      onFailure : err => callback(err, null)
    });
  }

  confirmPassword(username, code, newPassword, callback) {
    const cognitoUser = this.getCognitoUser(username, this.userPool);
    cognitoUser.confirmPassword(code,  newPassword, {
      onSuccess : () => callback(null, "Success"), 
      onFailure : err => callback(err, null)
    });
  }
  getCognitoUser(usernameOrEmail, userPool) { // global helper
    const userData = {
      Username : usernameOrEmail, 
      Pool : userPool
    }
    this.currentUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return this.currentUser;
  }

  getCurrentUser() {
    return this.userPool.getCurrentUser();
  }

  async signOut(reload : boolean) {
    if (this.getCurrentUser()) {
      this.userInfo.updateUserInfo({online : false}).subscribe(data => {
        if (this.getCurrentUser()) {
          this.getCurrentUser().signOut();
        }
        this.kickout(reload);
      }, err => console.log(err))
    } else {
      this.kickout(reload);
    }
  }

  async firstLogin(username, password, payload, callback) {
    await this.signOut(false);

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({Username : username,  Password : password});
    const cognitorUser = this.getCognitoUser(username, this.userPool);

    cognitorUser.authenticateUser(authenticationDetails, {
      onSuccess : result => {
        this.http.post(`${root}user`, payload).subscribe(data => {
          localStorage.clear();
          cognitorUser.authenticateUser(authenticationDetails, {
            onSuccess : result => {
              this.getTemporaryCred(err => {
                if (err) callback(err);
                else callback(null) // go /home only after getting rid of the old credentials and storing the new one with an IAM role
              });
            },
            onFailure : err => {
              callback(err);
              localStorage.clear();
            }
          });
        }, err => callback(err));
      },

      onFailure : err => {
        callback(err);
        localStorage.clear();
      }
    });
  }

  async loginUser(usernameOrEmail, password, callback) { 
    await this.signOut(false)

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({Username : usernameOrEmail,  Password : password});
    const cognitorUser = this.getCognitoUser(usernameOrEmail, this.userPool);

    cognitorUser.authenticateUser(authenticationDetails, { // store tokens in local storage
      onSuccess :  result => {
        this.refreshTemporaryCred(err => {
          if (err) {
            console.log(err)
            localStorage.clear();
          }
          else {
            this.userInfo.updateUserInfo({online : true}).subscribe(data => callback(null, result), err => console.log(err));
          }
        })
      }, 
      onFailure : err => {
        callback(err, null);
        localStorage.clear();
      }
    });
  }

  refreshTemporaryCred(callback) { // user must be logged in.
    const credentials = (<CognitoIdentityCredentials>config.credentials);
    if (!credentials) {
      this.getTemporaryCred(err => err ? callback(err) : callback(null));
      return;
    }

    const needsRefresh = (<CognitoIdentityCredentials>config.credentials).needsRefresh();

    if (needsRefresh) {
      this.setNewCredentials(err => err ? callback(err) : callback(null));
      return;
    }
    callback(null);
  }
 
  getTemporaryCred(callback) {
    if (!this.currentUser) {
      this.currentUser = this.getCurrentUser();
    }
    if (this.currentUser) {
      this.currentUser.getSession((err, session) => {
        if (session) {
          const options = {
            IdentityPoolId : this.identityPoolId, 
            Logins : {
                [this.idpLoginUrl] : session.idToken.jwtToken
            }
          }
          config.credentials = new CognitoIdentityCredentials(options);
          config.region = this.region;
          this.setNewCredentials(callback);

        } else if (err) {
          callback(err)
        }
      });
    } else console.log("unable to get current user")
  }

  setNewCredentials(callback?) {
    const credentials = (<CognitoIdentityCredentials>config.credentials);

    credentials.get(err => {
      if (err) {
        callback(err);
        return;
      }
      callback(null); 
    });
  }

  kickout(reload : boolean) {
    this.cache.clearCache();
    localStorage.clear();
    if (reload) location.reload();   
  }
} 



