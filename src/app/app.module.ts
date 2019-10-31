import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalContent } from './wrapper/modal/modal-content.component';

import { AppRoutes } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthentificationModule } from './authentification/authentification.module';
import { ConversationComponent } from './wrapper/conversation/conversation.component';
import { WrapperComponent } from './wrapper/wrapper.component';
import { ChatComponent } from './wrapper/chat/chat.component';
import { CurrentUserMessageComponent } from './wrapper/current-user-message/current-user-message.component';
import { OtherUserMessageComponent } from './wrapper/other-user-message/other-user-message.component';
import { TopPanelComponent } from './wrapper/top-panel/top-panel.component';
import { SidePanelComponent } from './wrapper/side-panel/side-panel.component';
import { UsersInChatComponent } from './wrapper/users-in-chat/users-in-chat.component';
import  { AuthInterceptor} from './interceptors/auth.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { AuthService} from './services/auth.service';
import { ProfileComponent } from './wrapper/profile/profile.component';
import  { UserResolver } from './resolvers/user.resolver';
import { NewConversationComponent } from './wrapper/new-conversation/new-conversation.component';
import { UploadPicComponent } from './wrapper/upload-pic/upload-pic.component';
import { FormValidatorService } from './services/form-validator.service';
import { CommonModule } from '@angular/common';
import { UserInfoService } from './services/user-info.service';
import { ImageResolver } from './resolvers/image.resolver';
import { CacheService } from './services/cache.service';
import { ImageService } from './services/image.service';
import { MinSidePanelComponent } from './wrapper/min-side-panel/min-side-panel.component';
import { UserDisplayComponent } from './wrapper/user-display/user-display.component';
import { RouteService } from './services/route.service';
import { ConversationDisplayComponent } from './wrapper/conversation-display/conversation-display.component';
import { InviteComponent } from './wrapper/invite/invite.component';
import { UiService } from './services/ui.service';
import { InviteDisplayComponent } from './wrapper/invite-display/invite-display.component';
import { MatBadgeModule } from '@angular/material/badge';


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
    ModalContent,
    MinSidePanelComponent,
    UserDisplayComponent,
    ConversationDisplayComponent,
    InviteComponent,
    InviteDisplayComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    HttpClientModule,
    AuthentificationModule, // routes here are registered first before the main one
    AppRoutes,
    Ng2ImgMaxModule,
    NgbModule,
    MatBadgeModule
  ],
  exports : [],

  providers: [
    { provide : HTTP_INTERCEPTORS, useClass : CacheInterceptor, multi : true }, 
    { provide : HTTP_INTERCEPTORS, useClass : AuthInterceptor, multi : true }, 
    UserResolver, 
    ImageResolver,  
    FormValidatorService,
    RouteService, 
    UserInfoService,
    AuthService, 
    CacheService,
    ImageService,
    UiService,
    NgbActiveModal
  ],

  bootstrap : [AppComponent],
  entryComponents : [ModalContent]
})
export class AppModule { }
