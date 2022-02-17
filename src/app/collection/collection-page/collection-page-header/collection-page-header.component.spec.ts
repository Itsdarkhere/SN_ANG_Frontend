import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionPageHeaderComponent } from './collection-page-header.component';

describe('CollectionPageHeaderComponent', () => {
  let component: CollectionPageHeaderComponent;
  let fixture: ComponentFixture<CollectionPageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionPageHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionPageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
