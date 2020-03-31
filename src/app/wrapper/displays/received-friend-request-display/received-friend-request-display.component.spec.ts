import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedFriendRequestDisplayComponent } from './received-friend-request-display.component';

describe('ReceivedFriendRequestDisplayComponent', () => {
  let component: ReceivedFriendRequestDisplayComponent;
  let fixture: ComponentFixture<ReceivedFriendRequestDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceivedFriendRequestDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivedFriendRequestDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
