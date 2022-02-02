import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionProfileContentComponent } from './collection-profile-content.component';

describe('CollectionProfileContentComponent', () => {
  let component: CollectionProfileContentComponent;
  let fixture: ComponentFixture<CollectionProfileContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionProfileContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionProfileContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
