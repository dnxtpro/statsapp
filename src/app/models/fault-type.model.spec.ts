import { FaultType } from './fault-type.model';

describe('FaultType', () => {
  it('should create an instance', () => {
    expect(new FaultType(1, 'Test', 1)).toBeTruthy();
  });
});
