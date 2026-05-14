import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionsCarousel } from './predictions-carousel';

describe('PredictionsCarousel', () => {
  let component: PredictionsCarousel;
  let fixture: ComponentFixture<PredictionsCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredictionsCarousel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredictionsCarousel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
