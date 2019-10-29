import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteDisplayComponent } from './invite-display.component';

describe('InviteDisplayComponent', () => {
  let component: InviteDisplayComponent;
  let fixture: ComponentFixture<InviteDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InviteDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
