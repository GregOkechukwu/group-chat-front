import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageArchiveComponent } from './message-archive.component';

describe('MessageArchiveComponent', () => {
  let component: MessageArchiveComponent;
  let fixture: ComponentFixture<MessageArchiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageArchiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
