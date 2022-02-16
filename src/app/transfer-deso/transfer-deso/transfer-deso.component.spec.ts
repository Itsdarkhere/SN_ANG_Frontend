import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferDesoComponent } from './transfer-deso.component';

describe('TransferDesoComponent', () => {
  let component: TransferDesoComponent;
  let fixture: ComponentFixture<TransferDesoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferDesoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferDesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
