import { HumanizeDurationPipe } from './humanize-duration.pipe';

describe('HumanizeDurationPipe', () => {
  it('create an instance', () => {
    const pipe = new HumanizeDurationPipe();
    expect(pipe).toBeTruthy();
  });
});
