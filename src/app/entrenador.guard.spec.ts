import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EntrenadorGuard } from './entrenador.guard';
import { StorageService } from './_services/storage.service';

describe('EntrenadorGuard', () => {
  let guard: EntrenadorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EntrenadorGuard,
        { provide: StorageService, useValue: { getUser: () => ({ roles: [] }) } },
        { provide: Router, useValue: { navigateByUrl: jasmine.createSpy('navigateByUrl') } },
      ],
    });
    guard = TestBed.inject(EntrenadorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
