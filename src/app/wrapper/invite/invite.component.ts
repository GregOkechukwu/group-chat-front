import { Component, OnInit, Input } from '@angular/core';
import { Invite } from 'aws-sdk/clients/chime';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit {
  @Input() invites : Invite[];

  constructor() { }

  ngOnInit() {
  }

}
