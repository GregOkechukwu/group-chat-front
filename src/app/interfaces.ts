import { HttpResponse } from '@angular/common/http';

/* Register, Login interfaces */

export interface RegisterUserInfo {  
    username : string;
    email : string;
    firstName : string;
    lastName : string;
    dateCreated : string;
}

/* UserInfo, Conversation, Invite, Friend interfaces  */

export interface ChatUser {
    userId : string,
    username : string;
    firstName : string;
    lastName : string;
    isOnline : boolean;
    hasProfilePic : boolean;
    byteArrBase64 : string;
    mimeType : string;
    inChat : boolean;
    isHost : boolean;
}

export interface SearchedUser {
    userId : string,
    username : string;
    firstName : string;
    lastName : string;
    isOnline : boolean;
    byteArrBase64? : string;
    mimeType? : string;
    dateAdded? : string;
}

export interface CurrentUser {
    username : string;
    firstName : string;
    lastName : string;
    email? : string;
    hasProfilePic? : boolean;
    inviteCount? : number;
}

export interface Invite {
    inviteId : string;
    conversationId : string;
    conversationName : string;
    userId : string;
    username : string;
    firstName : string;
    lastName : string;
    isOnline : boolean;
    hasProfilePic : boolean;
    dateSent : string;
    byteArrBase64 : string;
    mimeType : string;
}

export interface FriendRequest {
    friendRequestId : string;
    userId : string;
    username : string;
    firstName : string;
    lastName : string;
    isOnline : boolean;
    hasProfilePic : boolean;
    dateSent : string;
    byteArrBase64 : string;
    mimeType : string;
}

export interface Conversation {
    conversationId : string;
    conversationName : string;
    conversationHost : string;
    userCount : string;
    prioritizedPics : {
        hostUser : PicResponse;
        prioritizedUserA : PicResponse;
        prioritizedUserB : PicResponse;
    }
}

export interface Availability {
    usernameTaken? : boolean;
    emailTaken? : boolean;
    conversationNameTaken? : boolean;
}

/* Cache Interfaces */

export interface ResponseCacheEntry {
    lastRead : number;
    response : HttpResponse<any>;
}

/* Image Interfaces */

export interface PicResponse {
    byteArrBase64 : string;
    mimeType : string;
    hasProfilePic? : boolean
}
  
export interface IconResponse {
    byteArrBase64s : any;
    mimeType : string;
}

/* UI Interfaces */

export interface SectionStatus {
    showProfile : boolean;
    showConversations : boolean;
    showInvites : boolean;
    showFriends : boolean;
}

export interface DialogData {
    title : string;
    content : string;
}






  