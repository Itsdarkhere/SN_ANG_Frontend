import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImxPageComponent } from './imx-page.component';

describe('ImxPageComponent', () => {
  let component: ImxPageComponent;
  let fixture: ComponentFixture<ImxPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImxPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImxPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
