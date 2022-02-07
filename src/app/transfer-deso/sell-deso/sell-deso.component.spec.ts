import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellDesoComponent } from './sell-deso.component';

describe('SellDesoComponent', () => {
  let component: SellDesoComponent;
  let fixture: ComponentFixture<SellDesoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SellDesoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SellDesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
