import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentFriendDisplayComponent } from './current-friend-display.component';

describe('CurrentFriendDisplayComponent', () => {
  let component: CurrentFriendDisplayComponent;
  let fixture: ComponentFixture<CurrentFriendDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentFriendDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentFriendDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
