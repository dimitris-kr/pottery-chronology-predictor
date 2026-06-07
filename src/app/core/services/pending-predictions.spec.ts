import { TestBed } from '@angular/core/testing';

import { PendingPredictions } from './pending-predictions';

describe('PendingPredictions', () => {
  let service: PendingPredictions;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingPredictions);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
