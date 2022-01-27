import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallCardComponentComponent } from './small-card-component.component';

describe('SmallCardComponentComponent', () => {
  let component: SmallCardComponentComponent;
  let fixture: ComponentFixture<SmallCardComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmallCardComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmallCardComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
