import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopBidsComponent } from './top-bids.component';

describe('TopBidsComponent', () => {
  let component: TopBidsComponent;
  let fixture: ComponentFixture<TopBidsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopBidsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopBidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
