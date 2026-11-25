import { isReportTarget } from '../feed';

jest.mock('@amityco/ts-sdk-react-native', () => ({
  isReportedByMe: jest.fn(),
}));

const { isReportedByMe } = require('@amityco/ts-sdk-react-native');

describe('isReportTarget', () => {
  beforeEach(() => {
    isReportedByMe.mockReset();
  });

  it('answers true when the content is reported', async () => {
    isReportedByMe.mockResolvedValue(true);
    await expect(isReportTarget('comment', 'c1')).resolves.toBe(true);
    expect(isReportedByMe).toHaveBeenCalledWith('comment', 'c1');
  });

  it('answers false when it is not (it used to never settle)', async () => {
    isReportedByMe.mockResolvedValue(false);
    await expect(isReportTarget('comment', 'c1')).resolves.toBe(false);
  });

  it('answers false instead of throwing for a comment the server has not created yet', async () => {
    isReportedByMe.mockRejectedValue(
      new Error('Amity SDK (400400): CommentId c1 not found')
    );
    await expect(isReportTarget('comment', 'c1')).resolves.toBe(false);
  });
});
