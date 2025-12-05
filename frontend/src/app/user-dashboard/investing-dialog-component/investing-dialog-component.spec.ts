import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestingDialogComponent } from './investing-dialog-component';

describe('InvestingDialogComponent', () => {
  let component: InvestingDialogComponent;
  let fixture: ComponentFixture<InvestingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestingDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
