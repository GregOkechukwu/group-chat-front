import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateHostDialogComponent } from './update-host-dialog.component';

describe('UpdateHostDialogComponent', () => {
  let component: UpdateHostDialogComponent;
  let fixture: ComponentFixture<UpdateHostDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateHostDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateHostDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
