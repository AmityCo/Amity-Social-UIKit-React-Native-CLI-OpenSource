import { decode } from 'html-entities';
import { Image } from 'react-native';

import { PreviewData, PreviewDataImage, Size } from './types';
import { Client } from '@amityco/ts-sdk-react-native';

export const getActualImageUrl = (baseUrl: string, imageUrl?: string) => {
  let actualImageUrl = imageUrl?.trim();
  if (!actualImageUrl || actualImageUrl.startsWith('data')) return null;

  if (actualImageUrl.startsWith('//'))
    actualImageUrl = `https:${actualImageUrl}`;

  if (!actualImageUrl.startsWith('http')) {
    if (baseUrl.endsWith('/') && actualImageUrl.startsWith('/')) {
      actualImageUrl = `${baseUrl.slice(0, -1)}${actualImageUrl}`;
    } else if (!baseUrl.endsWith('/') && !actualImageUrl.startsWith('/')) {
      actualImageUrl = `${baseUrl}/${actualImageUrl}`;
    } else {
      actualImageUrl = `${baseUrl}${actualImageUrl}`;
    }
  }

  return actualImageUrl;
};

export const getHtmlEntitiesDecodedText = (text?: string) => {
  const actualText = text?.trim();
  if (!actualText) return null;

  return decode(actualText);
};

export const getContent = (left: string, right: string, type: string) => {
  const contents = {
    [left.trim()]: right,
    [right.trim()]: left,
  };

  return contents[type]?.trim();
};

export const getImageSize = (url: string) => {
  return new Promise<Size>((resolve, reject) => {
    Image.getSize(
      url,
      (width, height) => {
        resolve({ height, width });
      },
      // type-coverage:ignore-next-line
      (error) => reject(error)
    );
  });
};

// Functions below use functions from the same file and mocks are not working
/* istanbul ignore next */
export const getPreviewData = async (text: string) => {
  const previewData: PreviewData = {
    description: undefined,
    image: undefined,
    link: undefined,
    title: undefined,
  };

  try {
    const textWithoutEmails = text.replace(REGEX_EMAIL, '').trim();

    if (!textWithoutEmails) return previewData;

    const link = textWithoutEmails.match(REGEX_LINK)?.[0];

    if (!link) return previewData;

    let url = link;

    if (!url.toLowerCase().startsWith('http')) {
      url = 'https://' + url;
    }

    const request = await Client.fetchLinkPreview(url);

    return {
      description: request.description || undefined,
      image: request.image || undefined,
      link: url,
      title: request.title || undefined,
    };
  } catch {
    return previewData;
  }
};

/* istanbul ignore next */
export const getPreviewDataImage = async (url?: string) => {
  if (!url) return null;

  try {
    const { height, width } = await getImageSize(url);
    const aspectRatio = width / (height || 1);

    if (height > 100 && width > 100 && aspectRatio > 0.1 && aspectRatio < 10) {
      const image: PreviewDataImage = { height, url, width };
      return image;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

export const oneOf =
  <T extends (...args: A) => any, U, A extends any[]>(
    truthy: T | undefined,
    falsy: U
  ) =>
  (...args: Parameters<T>): ReturnType<T> | U => {
    return truthy ? truthy(...args) : falsy;
  };

export const REGEX_EMAIL =
  /([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
export const REGEX_IMAGE_CONTENT_TYPE = /image\/*/g;
// Consider empty line after img tag and take only the src field, space before to not match data-src for example
export const REGEX_IMAGE_TAG = /<img[\n\r]*.*? src=["'](.*?)["']/g;
export const REGEX_LINK =
  /((http|ftp|https):\/\/)?([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/i;
// Some pages write content before the name/property, some use single quotes instead of double
export const REGEX_META =
  /<meta.*?(property|name)=["'](.*?)["'].*?content=["'](.*?)["'].*?>/g;
export const REGEX_TITLE = /<title.*?>(.*?)<\/title>/g;
