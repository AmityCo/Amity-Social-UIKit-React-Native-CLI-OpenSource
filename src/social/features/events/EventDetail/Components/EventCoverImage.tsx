import { memo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { FileRepository } from '@amityco/ts-sdk-react-native';

const eventDefaultThumbnail = require('../../../../assets/images/eventDefaultThumbnail.png');

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

// Web parity: EventCover — 16:9 cover image with the default thumbnail
// fallback, full-bleed on mobile.
const EventCoverImage = ({ url }: { url?: string }) => {
  const [errorImage, setErrorImage] = useState(false);

  const source =
    !errorImage && url
      ? { uri: FileRepository.fileUrlWithSize(url, 'medium') }
      : eventDefaultThumbnail;

  return (
    <View style={styles.cover}>
      <Image
        source={source}
        style={styles.image}
        resizeMode="cover"
        onError={() => setErrorImage(true)}
      />
    </View>
  );
};

export default memo(EventCoverImage);
