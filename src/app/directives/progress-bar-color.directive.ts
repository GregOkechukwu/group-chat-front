import { Directive, OnChanges, Input, ElementRef, SimpleChanges } from '@angular/core';

/*
  Solution to dynamically changing the color of Angular Material's Progress bar.
  Source : https://stackoverflow.com/questions/52330515/change-angular-material-progress-bar-color-from-code
*/

@Directive({
  selector: '[appProgressBarColor]'
})
export class ProgressBarColorDirective implements OnChanges {
  static counter = 0;

  @Input() appProgressBarColor;
  styleEl:HTMLStyleElement = document.createElement('style');

  //generate unique attribule which we will use to minimise the scope of our dynamic style 
  uniqueAttr = `app-progress-bar-color-${ProgressBarColorDirective.counter++}`;

  constructor(private el: ElementRef) { 
    const nativeEl: HTMLElement = this.el.nativeElement;
    nativeEl.setAttribute(this.uniqueAttr,'');
    nativeEl.appendChild(this.styleEl);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateColor();
  }

  updateColor(): void {
    this.styleEl.innerText = `
      [${this.uniqueAttr}] .mat-progress-bar-fill::after {
        background-color: ${this.appProgressBarColor};
      }
    `;
  }

}
