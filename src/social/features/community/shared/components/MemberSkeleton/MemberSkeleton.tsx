import React from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';
import { useStyles } from './styles';

const MemberSkeleton = () => {
  const { theme } = useStyles();

  return (
    <ContentLoader
      width={200}
      height={44}
      backgroundColor={theme.colors.baseShade4}
      foregroundColor={theme.colors.baseShade4}
    >
      <Circle cx="22" cy="22" r="20" />
      <Rect x="55" y="14" rx="6" ry="6" width="140" height="12" />
    </ContentLoader>
  );
};

export default MemberSkeleton;
