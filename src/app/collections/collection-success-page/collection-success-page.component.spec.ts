import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionSuccessPageComponent } from './collection-success-page.component';

describe('CollectionSuccessPageComponent', () => {
  let component: CollectionSuccessPageComponent;
  let fixture: ComponentFixture<CollectionSuccessPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionSuccessPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionSuccessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
