import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickFactsComponent } from './quick-facts.component';

describe('QuickFactsComponent', () => {
  let component: QuickFactsComponent;
  let fixture: ComponentFixture<QuickFactsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickFactsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickFactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
