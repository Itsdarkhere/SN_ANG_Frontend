import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageCreatorsComponent } from './landing-page-creators.component';

describe('LandingPageCreatorsComponent', () => {
  let component: LandingPageCreatorsComponent;
  let fixture: ComponentFixture<LandingPageCreatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandingPageCreatorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPageCreatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
