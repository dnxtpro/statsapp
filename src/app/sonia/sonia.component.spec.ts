import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoniaComponent } from './sonia.component';

describe('SoniaComponent', () => {
  let component: SoniaComponent;
  let fixture: ComponentFixture<SoniaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SoniaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SoniaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
