import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EthNftPostPageComponent } from './eth-nft-post-page.component';

describe('EthNftPostPageComponent', () => {
  let component: EthNftPostPageComponent;
  let fixture: ComponentFixture<EthNftPostPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EthNftPostPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EthNftPostPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
