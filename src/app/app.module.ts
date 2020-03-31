import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { AppRoutes } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConversationComponent } from './wrapper/conversation/conversation.component';
import { WrapperComponent } from './wrapper/wrapper.component';
import { ChatComponent } from './wrapper/chat/chat.component';
import { CurrentUserMessageComponent } from './wrapper/current-user-message/current-user-message.component';
import { OtherUserMessageComponent } from './wrapper/other-user-message/other-user-message.component';
import { TopPanelComponent } from './wrapper/top-panel/top-panel.component';
import { SidePanelComponent } from './wrapper/side-panel/side-panel.component';
import { UsersInChatComponent } from './wrapper/users-in-chat/users-in-chat.component';
import { AuthInterceptor} from './interceptors/auth.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { AuthService} from './services/auth.service';
import { ProfileComponent } from './wrapper/profile/profile.component';
import { UserResolver } from './resolvers/user.resolver';
import { NewConversationComponent } from './wrapper/new-conversation/new-conversation.component';
import { UploadPicComponent } from './wrapper/upload-pic/upload-pic.component';
import { FormValidatorService } from './services/form-validator.service';
import { UserInfoService } from './services/user-info.service';
import { ImageResolver } from './resolvers/image.resolver';
import { CacheService } from './services/cache.service';
import { ImageService } from './services/image.service';
import { MinSidePanelComponent } from './wrapper/min-side-panel/min-side-panel.component';
import { UserDisplayComponent } from './wrapper/displays/user-display/user-display.component';
import { ConversationDisplayComponent } from './wrapper/displays/conversation-display/conversation-display.component';
import { InviteComponent } from './wrapper/invite/invite.component';
import { UiService } from './services/ui.service';
import { ReceivedInviteDisplayComponent } from './wrapper/displays/received-invite-display/received-invite-display.component';
import { MessageArchiveComponent } from './message-archive/message-archive.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthGuardForHome, AuthGuardForLoginRegister } from './guards/auth.guard';
import { MainDialogComponent } from '../app/dialogs/main-dialog/main-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { UpdateUserDialogComponent } from './dialogs/update-user-dialog/update-user-dialog.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { InviteResolver } from './resolvers/invite.resolver';
import { SentInviteDisplayComponent } from './wrapper/displays/sent-invite-display/sent-invite-display.component';
import { FriendComponent } from './wrapper/friend/friend.component';
import { FilterSearchDisplayComponent } from './wrapper/displays/filter-search-display/filter-search-display.component';
import { AddFriendComponent } from './wrapper/add-friend/add-friend.component';
import { UserListDisplayComponent } from './wrapper/displays/user-list-display/user-list-display.component';
import { FirstSectionComponent } from './wrapper/displays/first-section/first-section.component';
import { ReceivedFriendRequestDisplayComponent } from './wrapper/displays/received-friend-request-display/received-friend-request-display.component';
import { SentFriendRequestDisplayComponent } from './wrapper/displays/sent-friend-request-display/sent-friend-request-display.component';
import { CurrentFriendDisplayComponent } from './wrapper/displays/current-friend-display/current-friend-display.component';

@NgModule({
  declarations: [
    AppComponent,
    ConversationComponent,
    WrapperComponent,
    ChatComponent,
    CurrentUserMessageComponent,
    OtherUserMessageComponent,
    TopPanelComponent,
    SidePanelComponent,
    UsersInChatComponent,
    ProfileComponent,
    NewConversationComponent,
    UploadPicComponent,
    MinSidePanelComponent,
    UserDisplayComponent,
    ConversationDisplayComponent,
    InviteComponent,
    ReceivedInviteDisplayComponent,
    MessageArchiveComponent,
    MainDialogComponent,
    UpdateUserDialogComponent,
    SentInviteDisplayComponent,
    FriendComponent,
    FilterSearchDisplayComponent,
    AddFriendComponent,
    UserListDisplayComponent,
    FirstSectionComponent,
    ReceivedFriendRequestDisplayComponent,
    SentFriendRequestDisplayComponent,
    CurrentFriendDisplayComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AuthenticationModule, // routes here are registered first before the main one
    AppRoutes,
    Ng2ImgMaxModule,
    BrowserAnimationsModule,
    MatExpansionModule
  ],
  exports : [
  ],

  providers: [
    { provide :  MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration : 2500} },
    { provide : HTTP_INTERCEPTORS, useClass : CacheInterceptor, multi : true }, 
    { provide : HTTP_INTERCEPTORS, useClass : AuthInterceptor, multi : true }, 
    AuthGuardForHome,
    AuthGuardForLoginRegister,
    UserResolver, 
    ImageResolver,  
    InviteResolver,
    FormValidatorService,
    UserInfoService,
    AuthService, 
    CacheService,
    ImageService,
    UiService
  ],

  bootstrap : [AppComponent],
  entryComponents : [MessageArchiveComponent, MainDialogComponent, UpdateUserDialogComponent]
})
export class AppModule { }
