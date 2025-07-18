import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrPanel } from './hr-panel';

describe('HrPanel', () => {
  let component: HrPanel;
  let fixture: ComponentFixture<HrPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
