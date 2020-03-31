import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-first-section',
  templateUrl: './first-section.component.html',
  styleUrls: ['./first-section.component.css']
})
export class FirstSectionComponent implements OnInit {

  @Input() title : string;
  @Input() buttonAText : string;
  @Input() buttonBText : string;
  @Input() height : string | undefined;

  @Output() clickA : EventEmitter<void> = new EventEmitter<void>();
  @Output() clickB : EventEmitter<void> = new EventEmitter<void>();;

  constructor() { }

  ngOnInit() {
  }

  onClick(onClickA : boolean) {
    onClickA ? this.clickA.next() : this.clickB.next();
  }
}
