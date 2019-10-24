import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersInChatComponent } from './users-in-chat.component';

describe('UsersInChatComponent', () => {
  let component: UsersInChatComponent;
  let fixture: ComponentFixture<UsersInChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersInChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersInChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
