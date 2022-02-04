import { TestBed } from '@angular/core/testing';

import { TransactionalEmailService } from './transactional-email.service';

describe('TransactionalEmailService', () => {
  let service: TransactionalEmailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionalEmailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
