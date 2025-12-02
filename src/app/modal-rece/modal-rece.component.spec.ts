import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReceComponent } from './modal-rece.component';

describe('ModalReceComponent', () => {
  let component: ModalReceComponent;
  let fixture: ComponentFixture<ModalReceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalReceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalReceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
