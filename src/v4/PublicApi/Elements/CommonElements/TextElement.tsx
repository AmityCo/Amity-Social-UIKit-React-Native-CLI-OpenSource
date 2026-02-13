import { TextProps, Text } from 'react-native';
import React, { FC, memo } from 'react';
import { ComponentID, ElementID, PageID } from '../../../enums/enumUIKitID';
import useConfig from '../../../../social/hooks/useConfig';

type TextElementType = Partial<TextProps> & {
  pageID?: PageID;
  componentID?: ComponentID;
  elementID: ElementID;
  text: string;
};

const TextElement: FC<TextElementType> = ({
  pageID = PageID.WildCardPage,
  componentID = ComponentID.WildCardComponent,
  elementID,
  text,
  ...props
}) => {
  const { excludes } = useConfig();
  const configId = `${pageID}/${componentID}/${elementID}`;
  if (excludes.includes(configId)) return null;
  return (
    <Text testID={configId} accessibilityLabel={configId} {...props}>
      {text}
    </Text>
  );
};

export default memo(TextElement);
