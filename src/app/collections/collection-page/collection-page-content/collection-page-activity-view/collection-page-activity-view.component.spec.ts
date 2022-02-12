import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionPageActivityViewComponent } from './collection-page-activity-view.component';

describe('CollectionPageActivityViewComponent', () => {
  let component: CollectionPageActivityViewComponent;
  let fixture: ComponentFixture<CollectionPageActivityViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionPageActivityViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionPageActivityViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
