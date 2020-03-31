import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentInviteDisplayComponent } from './sent-invite-display.component';

describe('SentInviteDisplayComponent', () => {
  let component: SentInviteDisplayComponent;
  let fixture: ComponentFixture<SentInviteDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentInviteDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentInviteDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
