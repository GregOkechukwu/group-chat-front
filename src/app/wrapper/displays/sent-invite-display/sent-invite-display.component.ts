import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ImageService } from 'src/app/services/image.service';
import { UiService } from 'src/app/services/ui.service';
import { DataManipulationService } from 'src/app/services/data-manipulation.service';

@Component({
  selector: 'app-sent-invite-display',
  templateUrl: './sent-invite-display.component.html',
  styleUrls: ['./sent-invite-display.component.css']
})
export class SentInviteDisplayComponent implements OnInit {

  constructor(
    private dataManipulationService : DataManipulationService,
    private imageService : ImageService,
    private uiService : UiService
  ) { }

  @Output() cancel : EventEmitter<number> = new EventEmitter<number>();

  @Input() index : number;
  @Input() inviteId : string;
  @Input() conversationId : string;
  @Input() conversationName : string;
  @Input() recipientUsername : string;
  @Input() recipientFirstName : string;
  @Input() recipientLastName : string;
  @Input() isOnline : boolean;
  @Input() hasProfilePic : boolean;
  @Input() dateSent : string;
  @Input() base64 : string;
  @Input() mimeType : string;

  elapsedTime : string;
  pic : string;

  ngOnInit() {
    this.formatNames();
    this.encodePic();
    this.elapsedTime = this.dataManipulationService.getElapsedTime(this.dateSent);
    this.conversationName = this.conversationName.toUpperCase();
  }

  cancelInvite() {
    this.openDialog(
      "Confirm Cancel",
      "Are you sure you want to cancel this invite?",
      choseToCancel => {
        if (!choseToCancel) return;
        this.cancel.emit(this.index);
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
    const fullNames = this.dataManipulationService.formatFullname(this.recipientFirstName, this.recipientLastName, this.recipientUsername);

    this.recipientFirstName = fullNames[0];
    this.recipientLastName = fullNames[1];
    this.recipientUsername = fullNames[2];
  } 

  encodePic() {
    const src = this.imageService.encodePic(this.base64, this.mimeType);
    this.pic = <string>this.imageService.sanitize(src);
  }

}
