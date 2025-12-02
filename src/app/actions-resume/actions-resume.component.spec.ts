import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsResumeComponent } from './actions-resume.component';

describe('ActionsResumeComponent', () => {
  let component: ActionsResumeComponent;
  let fixture: ComponentFixture<ActionsResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActionsResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionsResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
