import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalContent } from '../modal/modal-content.component';

@Component({
  selector : 'app-top-panel',
  templateUrl : './top-panel.component.html',
  styleUrls : ['./top-panel.component.css']
})
export class TopPanelComponent implements OnInit {

  @ViewChild('offset') offsetDiv : ElementRef<HTMLDivElement>
  @Output() toggle = new EventEmitter<number>();
  @Output() windowWidth = new EventEmitter<number>();

  showMenuBar : boolean;
  offPanel = 0;
  smallPanel = 1;
  bigPanel = 2;
  switchPanel = 3;

  constructor(private authService : AuthService, private modalService : NgbModal) { }

  ngOnInit() {
    this.showMenuBar = true;
    this.checkWindowWidth(window.innerWidth);
  }

  openModal(header : string, mssg : string) {
    const modalRef = this.modalService.open(ModalContent, {centered : true});
    
    modalRef.componentInstance.header = header;
    modalRef.componentInstance.mssg = mssg;

    modalRef.result.then(confirm => {
      let reload = true;
      this.authService.signOut(reload);
    }, dismiss => null);
  }

  togglePanel(type : number) {
    this.toggle.emit(type);
  }

  checkWindowWidth(width : number) {
    this.windowWidth.emit(width);

    if (width < 415) {
      this.togglePanel(this.offPanel);

    } else if (width < 950) {
      this.togglePanel(this.smallPanel);

    } else if (width > 950) {
      this.togglePanel(this.bigPanel);
    }
  }

  onResize(event) {
    this.checkWindowWidth(event.target.innerWidth);
  }
}