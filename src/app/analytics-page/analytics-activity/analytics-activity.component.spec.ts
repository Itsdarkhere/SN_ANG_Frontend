import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsActivityComponent } from './analytics-activity.component';

describe('AnalyticsActivityComponent', () => {
  let component: AnalyticsActivityComponent;
  let fixture: ComponentFixture<AnalyticsActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsActivityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
