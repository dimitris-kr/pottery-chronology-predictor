import { TestBed } from '@angular/core/testing';

import { RetrainEligibility } from './retrain-eligibility';

describe('RetrainEligibility', () => {
  let service: RetrainEligibility;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetrainEligibility);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
