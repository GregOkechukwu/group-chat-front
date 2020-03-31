import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ImageService } from 'src/app/services/image.service';
import { DataManipulationService } from 'src/app/services/data-manipulation.service';

@Component({
  selector: 'app-user-display',
  templateUrl: './user-display.component.html',
  styleUrls: ['./user-display.component.css']
})
export class UserDisplayComponent implements OnInit {
  @ViewChild('user') user : ElementRef<HTMLDivElement>;

  @Input() index : number;
  @Input() userId : string;
  @Input() username : string;
  @Input() firstName : string;
  @Input() lastName : string;
  @Input() isOnline : boolean;
  @Input() base64 : string;
  @Input() mimeType : string;
  @Input() canToggle : boolean;
  @Output() select = new EventEmitter<number>();

  pic : string;
  isSelected : boolean;

  constructor(private dataManipulationService : DataManipulationService, private imageService : ImageService) { }

  ngOnInit() {
    this.formatNames();
    this.encodePic();

    this.isSelected = this.canToggle ? false : true;
  }

  selectUser() {
    if (this.canToggle) {
      this.isSelected = !this.isSelected;
      this.select.emit(this.index);
    }
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

  applyUserStyles() {
    if (this.user.nativeElement) {
      var el = this.user.nativeElement;
      var userFirstLast = <HTMLDivElement>el.children[1].children[0];
    }

    return {
      'opacity' : this.isSelected ? '1' : '0.65',
      'margin-top' : this.index === 0 ? '0' : '1rem',
      'margin-left' : this.isSelected ? '1.2rem' : null,
      'height' : el && userFirstLast.offsetHeight > 33 ? '7.2rem' : null
    }
  }
}
