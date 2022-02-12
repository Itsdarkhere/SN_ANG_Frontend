import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionPageSidebarComponent } from './collection-page-sidebar.component';

describe('CollectionPageSidebarComponent', () => {
  let component: CollectionPageSidebarComponent;
  let fixture: ComponentFixture<CollectionPageSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionPageSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionPageSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
