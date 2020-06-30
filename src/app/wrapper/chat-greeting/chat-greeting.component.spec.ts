import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatGreetingComponent } from './chat-greeting.component';

describe('ChatGreetingComponent', () => {
  let component: ChatGreetingComponent;
  let fixture: ComponentFixture<ChatGreetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatGreetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatGreetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
