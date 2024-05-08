import { TestBed } from '@angular/core/testing';

import { FaultTypeService } from './fault-type.service';

describe('FaultTypeService', () => {
  let service: FaultTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaultTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
