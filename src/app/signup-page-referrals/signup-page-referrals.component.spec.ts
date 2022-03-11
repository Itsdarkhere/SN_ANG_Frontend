import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupPageReferralsComponent } from './signup-page-referrals.component';

describe('SignupPageReferralsComponent', () => {
  let component: SignupPageReferralsComponent;
  let fixture: ComponentFixture<SignupPageReferralsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignupPageReferralsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupPageReferralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
