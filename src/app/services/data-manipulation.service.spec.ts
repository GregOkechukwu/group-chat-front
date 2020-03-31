import { TestBed } from '@angular/core/testing';

import { DataManipulationService } from './data-manipulation.service';

describe('DataManipulationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataManipulationService = TestBed.get(DataManipulationService);
    expect(service).toBeTruthy();
  });
});
