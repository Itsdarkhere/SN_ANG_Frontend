import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionProfilePageComponent } from './collection-profile-page.component';

describe('CollectionProfilePageComponent', () => {
  let component: CollectionProfilePageComponent;
  let fixture: ComponentFixture<CollectionProfilePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionProfilePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
