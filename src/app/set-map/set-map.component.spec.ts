import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetMapComponent } from './set-map.component';

describe('SetMapComponent', () => {
  let component: SetMapComponent;
  let fixture: ComponentFixture<SetMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SetMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
