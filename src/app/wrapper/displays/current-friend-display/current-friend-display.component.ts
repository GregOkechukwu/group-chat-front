import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { DataManipulationService } from 'src/app/services/data-manipulation.service';
import { ImageService } from 'src/app/services/image.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-current-friend-display',
  templateUrl: './current-friend-display.component.html',
  styleUrls: ['./current-friend-display.component.css']
})
export class CurrentFriendDisplayComponent implements OnInit {
  @Output() remove : EventEmitter<number> = new EventEmitter<number>();

  @Input() index : number;
  @Input() friendId : string;
  @Input() friendUsername : string;
  @Input() friendFirstName : string;
  @Input() friendLastName : string;
  @Input() isOnline : boolean;
  @Input() hasProfilePic : boolean;
  @Input() dateAdded : string;
  @Input() base64 : string;
  @Input() mimeType : string;

  pic : string;
  elapsedTime : string;
  
  constructor(
    private dataManipulationService : DataManipulationService,
    private imageService : ImageService,
    private uiService : UiService
  ) { }

  ngOnInit() {
    this.formatNames();
    this.elapsedTime = this.dataManipulationService.getElapsedTime(this.dateAdded);
    this.encodePic();
  }

  removeFriend() {
    this.openDialog(
      "Confirm Cancel",
      "Are you sure you want to remove this friend?",
      choseToCancel => {
        if (!choseToCancel) return;
        this.remove.emit(this.index);
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
    const fullNames = this.dataManipulationService.formatFullname(this.friendFirstName, this.friendLastName, this.friendUsername);

    this.friendFirstName = fullNames[0];
    this.friendLastName = fullNames[1];
    this.friendUsername = fullNames[2];
  } 

  encodePic() {
    const src = this.imageService.encodePic(this.base64, this.mimeType);
    this.pic = <string>this.imageService.sanitize(src);
  }

  formatUnit(elapsedTime : number, unit : string) {
    unit += elapsedTime > 1 ? 's' : '';
    return unit;
  }
}
