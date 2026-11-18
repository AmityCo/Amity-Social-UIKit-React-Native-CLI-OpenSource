import { getFileUrlWithSize } from '../index';

describe('getFileUrlWithSize', () => {
  it('adds the size to Amity API file urls', () => {
    expect(
      getFileUrlWithSize('https://api.sg.amity.co/api/v3/files/f1/download')
    ).toBe('https://api.sg.amity.co/api/v3/files/f1/download?size=medium');
  });

  it('adds the size to Amity CDN urls', () => {
    expect(getFileUrlWithSize('https://cdn.amity.co/abc', 'small')).toBe(
      'https://cdn.amity.co/abc?size=small'
    );
  });

  it('adds the size to file urls on a custom domain', () => {
    expect(
      getFileUrlWithSize('https://api.customer.com/api/v3/files/f1/download')
    ).toBe('https://api.customer.com/api/v3/files/f1/download?size=medium');
  });

  it('replaces an existing size and keeps other params', () => {
    expect(
      getFileUrlWithSize(
        'https://api.sg.amity.co/api/v3/files/f1/download?size=small&x=1',
        'large'
      )
    ).toBe('https://api.sg.amity.co/api/v3/files/f1/download?x=1&size=large');
  });

  it('leaves external urls alone, even with amity.co in the query', () => {
    const url = 'https://cdn.example.com/a.png?ref=x.amity.co';
    expect(getFileUrlWithSize(url)).toBe(url);
  });

  it('does not treat a lookalike host as Amity', () => {
    const url = 'https://notamity.co/a.png';
    expect(getFileUrlWithSize(url)).toBe(url);
  });

  it('leaves local files and empty values alone', () => {
    expect(getFileUrlWithSize('file:///tmp/a.png')).toBe('file:///tmp/a.png');
    expect(getFileUrlWithSize('')).toBe('');
  });
});
