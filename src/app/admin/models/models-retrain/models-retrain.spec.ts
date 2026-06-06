import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsRetrain } from './models-retrain';

describe('ModelsRetrain', () => {
  let component: ModelsRetrain;
  let fixture: ComponentFixture<ModelsRetrain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelsRetrain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelsRetrain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
