import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionSuccessComponent } from './collection-success.component';

describe('CollectionSuccessComponent', () => {
  let component: CollectionSuccessComponent;
  let fixture: ComponentFixture<CollectionSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionSuccessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
