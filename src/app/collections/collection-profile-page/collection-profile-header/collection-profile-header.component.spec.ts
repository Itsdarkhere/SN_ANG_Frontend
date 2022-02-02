import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionProfileHeaderComponent } from './collection-profile-header.component';

describe('CollectionProfileHeaderComponent', () => {
  let component: CollectionProfileHeaderComponent;
  let fixture: ComponentFixture<CollectionProfileHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionProfileHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionProfileHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
