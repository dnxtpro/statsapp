import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescargarResumenComponent } from './descargar-resumen.component';

describe('DescargarResumenComponent', () => {
  let component: DescargarResumenComponent;
  let fixture: ComponentFixture<DescargarResumenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DescargarResumenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescargarResumenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
