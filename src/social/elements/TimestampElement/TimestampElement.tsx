import { TextProps, Text } from 'react-native';
import { FC, memo } from 'react';
import { ComponentID, ElementID, PageID } from '../../enums/enumUIKitID';
import useConfig from '../../hooks/useConfig';
import { useTimeDifference } from '../../hooks';

type TimeStampElementType = Partial<TextProps> & {
  pageID?: PageID;
  componentID?: ComponentID;
  createdAt: string;
};

const TimeStampElement: FC<TimeStampElementType> = ({
  pageID = '*',
  componentID = '*',
  createdAt,
  ...props
}) => {
  const { excludes } = useConfig();
  const elementID = ElementID.timestamp;
  const configId = `${pageID}/${componentID}/${elementID}`;
  const text = useTimeDifference(createdAt);
  if (excludes.includes(configId)) return null;
  return (
    <Text testID={configId} accessibilityLabel={configId} {...props}>
      {text}
    </Text>
  );
};

export default memo(TimeStampElement);
