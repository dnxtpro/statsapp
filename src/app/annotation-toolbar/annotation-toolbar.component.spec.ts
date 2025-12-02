import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationToolbarComponent } from './annotation-toolbar.component';

describe('AnnotationToolbarComponent', () => {
  let component: AnnotationToolbarComponent;
  let fixture: ComponentFixture<AnnotationToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnotationToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnotationToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
