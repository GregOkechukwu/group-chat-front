import { Component, OnInit, Input } from '@angular/core';
import { UserInfo, UserInfoService } from 'src/app/services/user-info.service';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-invite-display',
  templateUrl: './invite-display.component.html',
  styleUrls: ['./invite-display.component.css']
})
export class InviteDisplayComponent implements OnInit {
  @Input() dateSent : string;
  @Input() conversationName : string;
  @Input() sender : UserInfo;

  elapsedTime : string;
  profilePic : string;
  defaultPic : string

  constructor(private userInfoService : UserInfoService, private imageService : ImageService) { }

  ngOnInit() {
    this.formatName(this.sender);
    this.elapsedTime = this.getElapsedTime(this.dateSent);

    if (!this.sender.hasProfilePic) {
      this.imageService.getDefaultPic((err, src) => {
        if (err) {
          console.log(err);
          return;
        }
        this.defaultPic = <string>this.imageService.sanitize(src);
      });
    } else {
      this.imageService.getUserPic(this.sender.username, this.sender.hasProfilePic, (err, src) => {
        if (err) {
          console.log(err);
          return;
        }
        this.profilePic = <string>this.imageService.sanitize(src);
      })
    }
  }

  formatName(sender : UserInfo) {
    const fullname = this.userInfoService.formatFullname(sender.firstname, sender.lastname, sender.username);

    sender.firstname = fullname[0];
    sender.lastname = fullname[1];
    sender.username = fullname[2];
  } 

  getElapsedTime(date : string) {
    const dateSent = Date.parse(date);
    const dateNow = Date.now();

    const minAgo = this.getMinutesAgo(dateSent, dateNow);
    const hrsAgo = this.getHoursAgo(dateSent, dateNow);
    const daysAgo = this.getDaysAgo(dateSent, dateNow);

    const elapsedTime = minAgo < 60 ? minAgo : hrsAgo < 24 ? hrsAgo : daysAgo;
    const timeUnit =  minAgo < 60 ? 'min' : hrsAgo < 24 ? 'hr' : 'day';

    return `${elapsedTime} ${this.formatUnit(elapsedTime, timeUnit)} ago`;
  }

  formatUnit(elapsedTime : number, unit : string) {
    unit += elapsedTime > 1 ? 's' : '';
    return unit;
  }

  getMinutesAgo(dateSent : number, dateNow : number) {
    return Math.floor(((dateNow - dateSent) / 1000) / 60);
  }

  getHoursAgo(dateSent : number, dateNow : number) {
    return Math.floor(this.getMinutesAgo(dateSent, dateNow) / 60);
  }

  getDaysAgo(dateSent : number, dateNow : number) {
    return Math.floor(this.getHoursAgo(dateSent, dateNow) / 24);
  }

}


