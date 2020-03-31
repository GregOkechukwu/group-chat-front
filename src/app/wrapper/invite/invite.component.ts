import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Invite } from 'src/app/interfaces';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs';
import { InviteInfoService } from 'src/app/services/invite-info.service';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit, AfterViewInit, OnDestroy {
  subscriptions : Subscription[] = [];
  section : number;

  inviteDefaultSection : number = 0;
  inviteReceivedSection : number = 1;
  inviteSentSection : number = 2;
  
  invites : Invite[];

  constructor(
    private uiService : UiService,
    private inviteInfoService : InviteInfoService
  ) { }

  ngOnInit() {
    this.toSection(this.inviteDefaultSection);
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  toSection(section : number) {
    this.section = section;
  }

  getReceivedInvites() {
    this.uiService.startLoadingScreen();

    const subscription = this.inviteInfoService.getReceivedInvites().subscribe((invites : Invite[]) => {
      this.invites = invites;
      this.toSection(this.inviteReceivedSection);
      
    }, null, () => this.uiService.stopLoadingScreen());

    this.subscriptions.push(subscription);
  }

  getSentInvites() {
    this.uiService.startLoadingScreen();

    const subscription = this.inviteInfoService.getSentInvites().subscribe((invites : Invite[]) => {
      this.invites = invites;
      this.toSection(this.inviteSentSection);
      
    }, null, () => this.uiService.stopLoadingScreen());

    this.subscriptions.push(subscription);
  }

  onAcceptOrDeclineInvite(event : {index : number, choseToAccept : boolean}) {
    const {index, choseToAccept} = event;     

    const inviteId = this.invites[index].inviteId;
    const conversationId = this.invites[index].conversationId;
    const mssg = choseToAccept ? "Accepted Invite Successfully" : "Declined Invite Successfully";

    if (choseToAccept) {
      this.uiService.startLoadingScreen();

      const subscription = this.inviteInfoService.acceptInvite(inviteId, conversationId, new Date().toUTCString()).subscribe(() => {
        /* GO TO CONVERSATION */
        this.getReceivedInvitesCount(() => {
          this.invites.splice(index, 1);
          this.uiService.openSnackBar(mssg);
        });

      }, null, () => this.uiService.stopLoadingScreen());

      this.subscriptions.push(subscription)
    }
    else {
      this.uiService.startLoadingScreen();

      const subscription = this.inviteInfoService.declineInvite(inviteId).subscribe(() => {
        this.getReceivedInvitesCount(() => {
          this.invites.splice(index, 1);
          this.uiService.openSnackBar(mssg);
        });

      }, null, () => this.uiService.stopLoadingScreen());

      this.subscriptions.push(subscription);
    }
  }

  onCancelInvite(index : number) {
    const inviteId = this.invites[index].inviteId;
    const mssg = "Cancelled Invite Successfully";

    this.uiService.startLoadingScreen();

    const subscription = this.inviteInfoService.cancelInvite(inviteId).subscribe(() => {
      this.getReceivedInvitesCount(() => {
        this.invites.splice(index, 1);
        this.uiService.openSnackBar(mssg);
      });

    }, null, () => this.uiService.stopLoadingScreen());

    this.subscriptions.push(subscription);
  }

  getReceivedInvitesCount(doSomething : Function) {
    const subscription = this.inviteInfoService.getReceivedInvitesCount().subscribe((inviteCount : number) => {
      this.inviteInfoService.inviteCountNotfier.next(inviteCount);
      doSomething();
    });

    this.subscriptions.push(subscription);
  }

}
 