import { TestBed } from '@angular/core/testing';

import { BooleanService } from './boolean.service';

describe('BooleanService', () => {
  let service: BooleanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BooleanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
