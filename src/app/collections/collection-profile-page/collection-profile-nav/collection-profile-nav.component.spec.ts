import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionProfileNavComponent } from './collection-profile-nav.component';

describe('CollectionProfileNavComponent', () => {
  let component: CollectionProfileNavComponent;
  let fixture: ComponentFixture<CollectionProfileNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionProfileNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionProfileNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
