import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionPageNftViewComponent } from './collection-page-nft-view.component';

describe('CollectionPageNftViewComponent', () => {
  let component: CollectionPageNftViewComponent;
  let fixture: ComponentFixture<CollectionPageNftViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionPageNftViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionPageNftViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
