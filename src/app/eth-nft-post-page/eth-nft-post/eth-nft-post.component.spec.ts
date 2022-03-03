import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EthNftPostComponent } from './eth-nft-post.component';

describe('EthNftPostComponent', () => {
  let component: EthNftPostComponent;
  let fixture: ComponentFixture<EthNftPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EthNftPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EthNftPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
