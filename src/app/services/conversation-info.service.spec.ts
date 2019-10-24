import { TestBed } from '@angular/core/testing';

import { ConversationInfoService } from './conversation-info.service';

describe('ConversationInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConversationInfoService = TestBed.get(ConversationInfoService);
    expect(service).toBeTruthy();
  });
});
