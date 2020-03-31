import { TestBed } from '@angular/core/testing';

import { InviteInfoService } from './invite-info.service';

describe('InviteInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InviteInfoService = TestBed.get(InviteInfoService);
    expect(service).toBeTruthy();
  });
});
