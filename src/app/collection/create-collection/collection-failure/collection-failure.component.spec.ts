import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionFailureComponent } from './collection-failure.component';

describe('CollectionFailureComponent', () => {
  let component: CollectionFailureComponent;
  let fixture: ComponentFixture<CollectionFailureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionFailureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionFailureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
