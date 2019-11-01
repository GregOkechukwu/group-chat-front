import { Component, OnInit, Input } from '@angular/core';
import { Invite, UserInfoService } from 'src/app/services/user-info.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageArchiveComponent } from '../message-archive/message-archive.component';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit {
  @Input() invites : Invite[];
  touched : boolean[];
  invitesCount : number;

  constructor(private snackbar : MatSnackBar, private userInfoService : UserInfoService) { }

  ngOnInit() {
    this.touched = new Array<boolean>(this.invites.length).fill(false);
    this.invitesCount = this.invites.length;
  }

  onAcceptOrDecline(event : {index : number, acceptedInvite : boolean}) {
    this.invitesCount--;
    this.touched[event.index] = true;

    const mssg = event.acceptedInvite ? 'Invite Accepted' : 'Invite Declined';
    
    this.snackbar.openFromComponent(MessageArchiveComponent,  {data : mssg});
    this.userInfoService.inviteCountNotifier.next(-1);
  }

  trackByFn(index : number, invite : Invite) {
    return invite.invite_id;
  }

}
