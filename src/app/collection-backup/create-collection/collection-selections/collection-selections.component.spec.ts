import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionSelectionsComponent } from './collection-selections.component';

describe('CollectionSelectionsComponent', () => {
  let component: CollectionSelectionsComponent;
  let fixture: ComponentFixture<CollectionSelectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionSelectionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionSelectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
