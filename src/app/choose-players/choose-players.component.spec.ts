import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosePlayersComponent } from './choose-players.component';

describe('ChoosePlayersComponent', () => {
  let component: ChoosePlayersComponent;
  let fixture: ComponentFixture<ChoosePlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChoosePlayersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChoosePlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
