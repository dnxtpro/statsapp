import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchDetailsXddComponent } from './match-details-xdd.component';

describe('MatchDetailsXddComponent', () => {
  let component: MatchDetailsXddComponent;
  let fixture: ComponentFixture<MatchDetailsXddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MatchDetailsXddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatchDetailsXddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
