import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingReferralsComponent } from './landing-referrals.component';

describe('LandingReferralsComponent', () => {
  let component: LandingReferralsComponent;
  let fixture: ComponentFixture<LandingReferralsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandingReferralsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingReferralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
