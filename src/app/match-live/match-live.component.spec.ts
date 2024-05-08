import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchLiveComponent } from './match-live.component';

describe('MatchLiveComponent', () => {
  let component: MatchLiveComponent;
  let fixture: ComponentFixture<MatchLiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MatchLiveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatchLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
