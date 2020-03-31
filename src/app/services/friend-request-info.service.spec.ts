import { TestBed } from '@angular/core/testing';

import { FriendRequestInfoService } from './friend-request-info.service';

describe('FriendRequestInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FriendRequestInfoService = TestBed.get(FriendRequestInfoService);
    expect(service).toBeTruthy();
  });
});
