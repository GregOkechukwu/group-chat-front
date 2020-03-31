import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SearchedUser } from 'src/app/interfaces';

@Component({
  selector: 'app-user-list-display',
  templateUrl: './user-list-display.component.html',
  styleUrls: ['./user-list-display.component.css']
})
export class UserListDisplayComponent implements OnInit {

  @Input() title : string;
  @Input() notFoundText : string | null;
  @Input() searchedUsers : SearchedUser[];
  @Input() chosenUsers : Array<boolean>;

  @Output() next : EventEmitter<void | string[]> = new EventEmitter<void | string[]>();

  chosenCount : number;

  constructor() { }

  ngOnInit() {
    if (!this.isAConfirmedList()) {
      this.chosenUsers.fill(false);
      this.chosenCount = 0;
    }
  }

  goNext() {
    this.isAConfirmedList ? this.next.next(this.getChosenUsers()) : this.next.next(); 
  }

  chooseUser(userIdx : number) {
    this.chosenUsers[userIdx] = !this.chosenUsers[userIdx];
    this.chosenCount += this.chosenUsers[userIdx] ? 1 : -1;
  }

  isAConfirmedList() {
    return this.notFoundText == null;
  }

  getChosenUsers() {
    const n = this.searchedUsers.length;
    const users = [];

    for (let i = 0; i < n; i++) {
      if (this.chosenUsers[i]) {
        users.push(this.searchedUsers[i].userId);
      }
    }

    return users;
  }
}
