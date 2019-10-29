import { Component, OnInit } from '@angular/core';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.css'],
  providers : []
})
export class WrapperComponent implements OnInit {
  showProfile : boolean;
  showConversations : boolean;
  showUsersInChat : boolean;
  showInvites : boolean;

  showFullPanel : boolean = true;
  innerWidth : number;
  
  offPanel = 0;
  smallPanel = 1;
  bigPanel = 2;
  switchPanel = 3;

  constructor(private uiService : UiService) {}

  ngOnInit() {
    this.show('showConversations');
  }

  show(section : string) {
    let sectionStatus = this.uiService.showSectionAndGetStatus(section);
    this.showProfile = sectionStatus.showProfile;
    this.showConversations = sectionStatus.showConversation;
    this.showUsersInChat = sectionStatus.showUsersInChat;
    this.showInvites = sectionStatus.showInvites;
  }

  togglePanel(event : number) {
    if (this.innerWidth < 700 && event === this.switchPanel) {
      if (this.showFullPanel === undefined) {
        this.showFullPanel = false;
        this.uiService.minSidePanelStatus.next(true);
      }
      else if (this.showFullPanel === false) {
        this.showFullPanel = undefined;
        this.uiService.minSidePanelStatus.next(false);
      }
      return;
    }

    if (event !== this.smallPanel) {
      this.uiService.minSidePanelStatus.next(false);
      if (event === this.offPanel) this.showFullPanel = undefined;
      if (event === this.bigPanel) this.showFullPanel = true;
      if (event === this.switchPanel) this.showFullPanel = !this.showFullPanel;
    }
    else if (event === 1) {
      this.showFullPanel = false;
      this.uiService.minSidePanelStatus.next(true);
    }

  }

  updateWindowWidth(event : number) {
    this.innerWidth = event;
  }



}
