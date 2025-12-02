import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoRecompensaComponent } from './dialogo-recompensa.component';

describe('DialogoRecompensaComponent', () => {
  let component: DialogoRecompensaComponent;
  let fixture: ComponentFixture<DialogoRecompensaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogoRecompensaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoRecompensaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
