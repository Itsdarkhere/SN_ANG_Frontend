import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallGraphComponent } from './small-graph.component';

describe('SmallGraphComponent', () => {
  let component: SmallGraphComponent;
  let fixture: ComponentFixture<SmallGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmallGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmallGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
