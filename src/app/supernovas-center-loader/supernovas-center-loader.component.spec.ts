import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupernovasCenterLoaderComponent } from './supernovas-center-loader.component';

describe('SupernovasCenterLoaderComponent', () => {
  let component: SupernovasCenterLoaderComponent;
  let fixture: ComponentFixture<SupernovasCenterLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupernovasCenterLoaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupernovasCenterLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
