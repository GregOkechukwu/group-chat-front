import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-user-display',
  templateUrl: './user-display.component.html',
  styleUrls: ['./user-display.component.css']
})
export class UserDisplayComponent implements OnInit {
  @ViewChild('user') user : ElementRef<HTMLDivElement>

  @Input() index : number;
  @Input() firstname : string;
  @Input() lastname : string;
  @Input() username : string;
  @Input() isOnline : boolean;
  @Input() hasProfilePic : boolean;
  @Input() img : any | null;
  @Input() isSelected : boolean;
  @Input() canToggle : boolean;

  profilePic : string;
  defaultPic : string;

  @Output() select = new EventEmitter<string>();

  constructor(private imageService : ImageService) { }

  ngOnInit() {
    if (!this.hasProfilePic) {
      this.imageService.getDefaultPic((err, src) => {
        if (err) {
          console.log(err);
          return;
        }
        this.defaultPic = <string>this.imageService.sanitize(src);
      });
    } else {
      this.profilePic = this.imageService.encodePic(this.img.Body.data, this.img.ContentType);
      this.profilePic = <string>this.imageService.sanitize(this.profilePic);
    }
  }

  selectUser() {
    if (this.canToggle) {
      this.isSelected = !this.isSelected;
      this.select.emit(this.username);
    }
  }

  applyUserStyles() : Object {
    if (this.user.nativeElement) {
      var el = this.user.nativeElement;
      var userFirstLast = <HTMLDivElement>el.children[1].children[0]
    }
    return {
      'box-shadow' : this.isSelected ? '0 10px 6px -6px #777' : null,
      'color' : this.isSelected ? 'black' : null,
      'border' : this.isSelected ? '1px solid black' : null,
      'height' : el && userFirstLast.offsetHeight > 33 ? '7.2rem' : null
    }
  }
}
