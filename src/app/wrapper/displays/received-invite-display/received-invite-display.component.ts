import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ImageService } from 'src/app/services/image.service';
import { UiService } from 'src/app/services/ui.service';
import { DataManipulationService } from 'src/app/services/data-manipulation.service';

@Component({
  selector: 'app-received-invite-display',
  templateUrl: './received-invite-display.component.html',
  styleUrls: ['./received-invite-display.component.css']
})
export class ReceivedInviteDisplayComponent implements OnInit {
  @Output() acceptOrDecline : EventEmitter<{index : number, choseToAccept : boolean}> = new EventEmitter<{index : number, choseToAccept : boolean}>();

  @Input() index : number;
  @Input() inviteId : string;
  @Input() conversationId : string;
  @Input() conversationName : string;
  @Input() senderUsername : string;
  @Input() senderFirstName : string;
  @Input() senderLastName : string;
  @Input() isOnline : boolean;
  @Input() hasProfilePic : boolean;
  @Input() dateSent : string;
  @Input() base64 : string;
  @Input() mimeType : string;

  elapsedTime : string;
  pic : string;

  constructor(
    private dataManipulationService : DataManipulationService,
    private imageService : ImageService,
    private uiService : UiService
  ) { }

  ngOnInit() {
    this.formatNames();
    this.encodePic();
    this.elapsedTime = this.dataManipulationService.getElapsedTime(this.dateSent);
    this.conversationName = this.conversationName.toUpperCase();
  }

  acceptInvite() {
    this.openDialog(
      "Confirm Accept",
      "Are you sure you want to accept this invite?",
      choseToAccept => {
        if (!choseToAccept) return;

        this.acceptOrDecline.emit({
          index : this.index,
          choseToAccept : true
        });
      }
    );
  }

  declineInvite() {
    this.openDialog(
      "Confirm Decline",
      "Are you sure you want to decline this invite?",
      choseToDecline => {
        if (!choseToDecline) return;

        this.acceptOrDecline.emit({
          index : this.index,
          choseToAccept : false
        });
      }
    );
  }

  openDialog(title : string, content : string, doSomething : Function) {
    const heightPx = "225px", widthPx = "500px";

    this.uiService.openDialog(
      heightPx,
      widthPx,
      title,
      content,
      doSomething
    );
  }

  formatNames() {
    const fullNames = this.dataManipulationService.formatFullname(this.senderFirstName, this.senderLastName, this.senderUsername);

    this.senderFirstName = fullNames[0];
    this.senderLastName = fullNames[1];
    this.senderUsername = fullNames[2];
  } 

  encodePic() {
    const src = this.imageService.encodePic(this.base64, this.mimeType);
    this.pic = <string>this.imageService.sanitize(src);
  }
}


