import { Component, OnInit, Input, ViewContainerRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-chat-greeting',
  templateUrl: './chat-greeting.component.html',
  styleUrls: ['./chat-greeting.component.css']
})
export class ChatGreetingComponent implements OnInit {

  @Input() isCurrentUser : boolean;
  @Input() greeting : string;

  constructor() { }

  ngOnInit() {
  }

}
