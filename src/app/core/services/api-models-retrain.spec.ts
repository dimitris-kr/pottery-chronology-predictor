import { TestBed } from '@angular/core/testing';

import { ApiModelsRetrain } from './api-models-retrain';

describe('ApiModelsRetrain', () => {
  let service: ApiModelsRetrain;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiModelsRetrain);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
