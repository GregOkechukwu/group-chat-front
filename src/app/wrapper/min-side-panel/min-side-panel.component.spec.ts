import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinSidePanelComponent } from './min-side-panel.component';

describe('MinSidePanelComponent', () => {
  let component: MinSidePanelComponent;
  let fixture: ComponentFixture<MinSidePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinSidePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
