import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUserDisplayComponent } from './chat-user-display.component';

describe('ChatUserDisplayComponent', () => {
  let component: ChatUserDisplayComponent;
  let fixture: ComponentFixture<ChatUserDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatUserDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatUserDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
