import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSearchDisplayComponent } from './filter-search-display.component';

describe('FilterSearchDisplayComponent', () => {
  let component: FilterSearchDisplayComponent;
  let fixture: ComponentFixture<FilterSearchDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterSearchDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterSearchDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
