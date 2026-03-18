import React, { FC, memo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { ComponentID, ElementID, PageID } from '../../enum';
import { useAmityElement } from '../../hook';
import { Image, View } from 'react-native';
import { useStyles } from './styles';
import { Typography } from '../../component/Typography/Typography';
import { SvgXml } from 'react-native-svg';
import { community as communityIcon } from '../../assets/icons';
import { getFileUrlWithSize } from '../../../v4/utils';

type CommunityRowImageyProps = {
  fileUrl?: string;
  pageId?: PageID;
  componentId?: ComponentID;
  label?: string;
};

const CommunityRowImagey: FC<CommunityRowImageyProps> = ({
  fileUrl,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  label,
}) => {
  const elementId = ElementID.community_row_image;
  const styles = useStyles();
  const { accessibilityId } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });

  return (
    <View testID={accessibilityId} style={styles.container}>
      {fileUrl ? (
        <Image
          source={{ uri: getFileUrlWithSize(fileUrl) }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <SvgXml xml={communityIcon()} width={36} height={22} />
        </View>
      )}
      {label && (
        <>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0)', 'transparent']}
            style={styles.gradientLayer}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
          />
          <Typography.BodyBold style={styles.label}>
            {label}
          </Typography.BodyBold>
        </>
      )}
    </View>
  );
};

export default memo(CommunityRowImagey);
