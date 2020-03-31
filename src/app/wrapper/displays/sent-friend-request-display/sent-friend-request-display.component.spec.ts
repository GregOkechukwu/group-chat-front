import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentFriendRequestDisplayComponent } from './sent-friend-request-display.component';

describe('SentFriendRequestDisplayComponent', () => {
  let component: SentFriendRequestDisplayComponent;
  let fixture: ComponentFixture<SentFriendRequestDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentFriendRequestDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentFriendRequestDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
