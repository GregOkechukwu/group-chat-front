import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedInviteDisplayComponent } from './received-invite-display.component';

describe('InviteDisplayComponent', () => {
  let component: ReceivedInviteDisplayComponent;
  let fixture: ComponentFixture<ReceivedInviteDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceivedInviteDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivedInviteDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
