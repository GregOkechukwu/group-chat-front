import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  minSidePanelStatus = new BehaviorSubject<boolean>(undefined);
  minSidePanelStatus$ = this.minSidePanelStatus.asObservable();

  constructor() { }
}
