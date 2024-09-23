import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMatch1Component } from './new-match1.component';

describe('NewMatch1Component', () => {
  let component: NewMatch1Component;
  let fixture: ComponentFixture<NewMatch1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewMatch1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewMatch1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
