import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListDisplayComponent } from './user-list-display.component';

describe('UserListDisplayComponent', () => {
  let component: UserListDisplayComponent;
  let fixture: ComponentFixture<UserListDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserListDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
