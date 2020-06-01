import { Component, OnInit, Input } from '@angular/core';
import { ChatUser } from 'src/app/interfaces';

@Component({
  selector: 'app-users-in-chat',
  templateUrl: './users-in-chat.component.html',
  styleUrls: ['./users-in-chat.component.css']
})
export class UsersInChatComponent implements OnInit {

  @Input() users : ChatUser[];

  constructor() { }

  ngOnInit() {
  }

}
