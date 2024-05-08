import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SextetoComponent } from './sexteto.component';

describe('SextetoComponent', () => {
  let component: SextetoComponent;
  let fixture: ComponentFixture<SextetoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SextetoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SextetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
