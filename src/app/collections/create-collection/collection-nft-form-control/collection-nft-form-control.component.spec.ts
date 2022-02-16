import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionNftFormControlComponent } from './collection-nft-form-control.component';

describe('CollectionNftFormControlComponent', () => {
  let component: CollectionNftFormControlComponent;
  let fixture: ComponentFixture<CollectionNftFormControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionNftFormControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionNftFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
