import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSmallNavNewComponent } from './page-small-nav-new.component';

describe('PageSmallNavNewComponent', () => {
  let component: PageSmallNavNewComponent;
  let fixture: ComponentFixture<PageSmallNavNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageSmallNavNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageSmallNavNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
