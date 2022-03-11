import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageDaoComponent } from './landing-page-dao.component';

describe('LandingPageDaoComponent', () => {
  let component: LandingPageDaoComponent;
  let fixture: ComponentFixture<LandingPageDaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandingPageDaoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPageDaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
