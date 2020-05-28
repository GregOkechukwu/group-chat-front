import { Component, OnInit, Input } from '@angular/core';
import { DataManipulationService } from 'src/app/services/data-manipulation.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-chat-user-display',
  templateUrl: './chat-user-display.component.html',
  styleUrls: ['./chat-user-display.component.css']
})
export class ChatUserDisplayComponent implements OnInit {

  @Input() index : number;
  @Input() userId : string;
  @Input() username : string;
  @Input() firstName : string;
  @Input() lastName : string;
  @Input() isOnline : boolean;
  @Input() base64 : string;
  @Input() mimeType : string;
  @Input() isInChat : boolean;
  @Input() isHost : boolean;

  pic : string;
  
  constructor(private dataManipulationService : DataManipulationService, private imageService : ImageService) { }

  ngOnInit() {
    this.formatNames();
    this.encodePic();
  }

  formatNames() {
    const fullName = this.dataManipulationService.formatFullname(this.firstName, this.lastName, this.username);

    this.firstName = fullName[0];
    this.lastName = fullName[1];
    this.username = fullName[2];
  }

  encodePic() {
    const src = this.imageService.encodePic(this.base64, this.mimeType);
    this.pic = <string>this.imageService.sanitize(src);
  }

}
