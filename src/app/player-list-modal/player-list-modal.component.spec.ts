import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerListModalComponent } from './player-list-modal.component';

describe('PlayerListModalComponent', () => {
  let component: PlayerListModalComponent;
  let fixture: ComponentFixture<PlayerListModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayerListModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayerListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
