import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector : 'modal-content',
    templateUrl :'./modal-content.component.html',
    styleUrls : ['./modal-content.component.css']
  })
  export class ModalContent {
    @Input() header : string;
    @Input() mssg : string;

    constructor(public activeModal : NgbActiveModal) { }

    close(type? : string) {
      this.activeModal.close(type);
    }

    dismiss(type? : string) {
      this.activeModal.dismiss(type);
    }

  }