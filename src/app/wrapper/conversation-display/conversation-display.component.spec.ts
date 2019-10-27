import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationDisplayComponent } from './conversation-display.component';

describe('ConversationDisplayComponent', () => {
  let component: ConversationDisplayComponent;
  let fixture: ComponentFixture<ConversationDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
