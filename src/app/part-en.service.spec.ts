import { TestBed } from '@angular/core/testing';

import { PartEnService } from './part-en.service';

describe('PartEnService', () => {
  let service: PartEnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartEnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
