import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityLeftBarComponent } from './activity-left-bar.component';

describe('ActivityLeftBarComponent', () => {
  let component: ActivityLeftBarComponent;
  let fixture: ComponentFixture<ActivityLeftBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivityLeftBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityLeftBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
