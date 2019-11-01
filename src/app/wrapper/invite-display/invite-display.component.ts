import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserInfo, UserInfoService } from 'src/app/services/user-info.service';
import { ImageService } from 'src/app/services/image.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalContent } from '../modal/modal-content.component';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-invite-display',
  templateUrl: './invite-display.component.html',
  styleUrls: ['./invite-display.component.css']
})
export class InviteDisplayComponent implements OnInit {
  private SubscriptionOne : Subscription;

  @Output() acceptOrDecline : EventEmitter<any> = new EventEmitter<{index : number, acceptedInvite : boolean}>();

  @Input() index : number;
  @Input() inviteId : string;
  @Input() dateSent : string;
  @Input() conversationId : string;
  @Input() conversationName : string;
  @Input() sender : UserInfo;

  elapsedTime : string;
  profilePic : string;
  defaultPic : string;

  constructor(private userInfoService : UserInfoService, private imageService : ImageService, private modalService : NgbModal) { }

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

  ngOnDestroy() {
    if (this.SubscriptionOne instanceof Subscription) this.SubscriptionOne.unsubscribe();
  }

  acceptInvite(event : KeyboardEvent | MouseEvent) {
    this.openModal(event, "Confirm Invite", "accept the invite");
  }

  declineInvite(event : KeyboardEvent | MouseEvent) {
    this.openModal(event, "Decline Invite", "decline the invite");
  }

  openModal(event : KeyboardEvent | MouseEvent, header : string, mssg : string) {
    const modalRef = this.modalService.open(ModalContent, {centered : true});
    modalRef.componentInstance.header = header;
    modalRef.componentInstance.mssg = mssg;

    const payload = {
      invite_id : this.inviteId,
      conversation_id : this.conversationId
    }

    modalRef.result.then(header => {
      let result : Observable<any>;
      let acceptedInvite = true;

      if (header === 'Confirm Invite') {
        result = this.userInfoService.acceptInvite(payload);
      } else {
        result = this.userInfoService.declineInvite(payload);
        acceptedInvite = false;
      }

      this.SubscriptionOne = result.subscribe(done => {
        this.deleteInvite(this.index, acceptedInvite);
      }, err => console.log(err));
    }, dismiss => {})

  }

  deleteInvite(index : number, acceptedInvite : boolean) {
    this.acceptOrDecline.emit({index, acceptedInvite});
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


