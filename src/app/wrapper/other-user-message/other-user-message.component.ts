import { Component, OnInit, Input } from '@angular/core';
import { DataManipulationService } from 'src/app/services/data-manipulation.service';
import { ImageService } from 'src/app/services/image.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-other-user-message',
  templateUrl: './other-user-message.component.html',
  styleUrls: ['./other-user-message.component.css']
})
export class OtherUserMessageComponent implements OnInit {

  @Input() userId : string;
  @Input() username : string;
  @Input() firstName : string;
  @Input() lastName : string;
  @Input() isOnline : boolean;
  @Input() hasProfilePic : boolean;
  @Input() base64 : string;
  @Input() mimeType : string;
  @Input() messageId : string;
  @Input() messageContent : string
  @Input() dateSent : string;

  pic : string;

  constructor(
    private dataManipulationService : DataManipulationService, 
    private imageService : ImageService,
    private uiService : UiService
  ) { }

  ngOnInit() {
    this.formatNames();
    this.encodePic();
  }

  formatNames() {
    const fullName = this.dataManipulationService.formatFullname(this.firstName, this.lastName, this.username);

    this.firstName = fullName[0];
    this.lastName = fullName[1][0] + '.';
    this.username = fullName[2];
  }

  encodePic() {
    const src = this.imageService.encodePic(this.base64, this.mimeType);
    this.pic = <string>this.imageService.sanitize(src);
  }

}
