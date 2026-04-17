import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelScoresChart } from './model-scores-chart';

describe('ModelScoresChart', () => {
  let component: ModelScoresChart;
  let fixture: ComponentFixture<ModelScoresChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelScoresChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelScoresChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
