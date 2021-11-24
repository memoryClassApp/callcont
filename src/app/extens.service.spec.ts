import { TestBed } from '@angular/core/testing';

import { ExtensService } from './extens.service';

describe('ExtensService', () => {
  let service: ExtensService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtensService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
