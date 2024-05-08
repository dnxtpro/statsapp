import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerDetailsDialogComponent } from './player-details-dialog.component';

describe('PlayerDetailsDialogComponent', () => {
  let component: PlayerDetailsDialogComponent;
  let fixture: ComponentFixture<PlayerDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayerDetailsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayerDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
