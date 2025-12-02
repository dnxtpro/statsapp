import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesModalComponent } from './detalles-modal.component';

describe('DetallesModalComponent', () => {
  let component: DetallesModalComponent;
  let fixture: ComponentFixture<DetallesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetallesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
