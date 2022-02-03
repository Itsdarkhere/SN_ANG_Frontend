import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionPageMenuComponent } from './collection-page-menu.component';

describe('CollectionPageMenuComponent', () => {
  let component: CollectionPageMenuComponent;
  let fixture: ComponentFixture<CollectionPageMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionPageMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionPageMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
