import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-conversation-display',
  templateUrl: './conversation-display.component.html',
  styleUrls: ['./conversation-display.component.css']
})
export class ConversationDisplayComponent implements OnInit {

  @Input() conversationname : string
  @Input() hostusername : string
  @Input() usercount : number;

  constructor() { }

  renderUserCount() {
    return this.usercount === 1 ? `${this.usercount} member` : `${this.usercount} members`;
  }

  
  ngOnInit() {
  }

}
