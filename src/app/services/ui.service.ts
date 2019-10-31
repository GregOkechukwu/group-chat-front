import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

interface SectionStatus {
  showProfile : boolean
  showConversation : boolean
  showUsersInChat : boolean
  showInvites : boolean
}

@Injectable({
  providedIn: 'root'
})

export class UiService {
  minSidePanelStatus = new BehaviorSubject<boolean>(undefined);
  minSidePanelStatus$ = this.minSidePanelStatus.asObservable();
  
  private sections : SectionStatus =  {
    showProfile : false,
    showConversation : false,
    showUsersInChat : false,
    showInvites : false
  }

  constructor() { }

  showSectionAndGetStatus(section : string) {
    if (section === 'showProfile') {
      this.sections.showProfile = true;
      this.sections.showConversation = false;
      this.sections.showUsersInChat = false;
      this.sections.showInvites = false;
    } else if (section === 'showConversations') {
      this.sections.showProfile = false;
      this.sections.showConversation = true;
      this.sections.showUsersInChat = false;
      this.sections.showInvites = false;
    } else if (section === 'showUsersInChat') {
      this.sections.showProfile = false;
      this.sections.showConversation = false;
      this.sections.showUsersInChat = true;
      this.sections.showInvites = false;
    } else if (section === 'showInvites') {
      this.sections.showProfile = false;
      this.sections.showConversation = false;
      this.sections.showUsersInChat = false;
      this.sections.showInvites = true;
    }

    return this.sections;
  }
}
