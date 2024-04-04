import { TestBed } from '@angular/core/testing';

import { EnchersServiceService } from './enchers-service.service';

describe('EnchersServiceService', () => {
  let service: EnchersServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnchersServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
