import { Component, OnInit } from '@angular/core';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.css'],
  providers : []
})
export class WrapperComponent implements OnInit {
  showProfile : boolean = false;
  showConversations : boolean = true;
  showUsersInChat : boolean = false;

  showFullPanel : boolean = true;
  innerWidth : number;

  constructor(private uiService : UiService) {}

  ngOnInit() {
  }

  showSection(section : string) {
    if(section === 'showProfile') {
      this.showProfile = true;
      this.showConversations = false;
      this.showUsersInChat = false;
    }
    else if (section === 'showConversations') {
      this.showConversations = true;
      this.showProfile = false;
      this.showUsersInChat = false;
    } else if (section === 'showUsersInChat') {
      this.showConversations = false;
      this.showProfile = false;
      this.showUsersInChat = true;
    }
  }
  togglePanel(event : number) {
    if (this.innerWidth < 700 && event === 3) {
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

    if (event !== 1) {
      this.uiService.minSidePanelStatus.next(false);
      if (event === 0) this.showFullPanel = undefined;
      if (event === 2) this.showFullPanel = true;
      if (event === 3) this.showFullPanel = !this.showFullPanel;
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
