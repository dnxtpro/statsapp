import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenPartidoComponent } from './resumen-partido.component';

describe('ResumenPartidoComponent', () => {
  let component: ResumenPartidoComponent;
  let fixture: ComponentFixture<ResumenPartidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResumenPartidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumenPartidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
