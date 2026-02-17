import React from 'react';
import { View } from 'react-native';
import { ComponentID, PageID } from '../../../../social/enums/enumUIKitID';
import { useAmityComponent } from '../../../../social/hooks';
import { ChangeThumbnailButton } from '../../../../social/elements/ChangeThumbnailButton';
import { DeleteThumbnailButton } from '../../../../social/elements/DeleteThumbnailButton';
import { useStyles } from './styles';

type AmityThumbnailActionComponentProps = {
  pageId?: PageID;
  onChangeThumbnail?: () => void;
  onDeleteThumbnail?: () => void;
};

const AmityThumbnailActionComponent = ({
  onChangeThumbnail,
  onDeleteThumbnail,
  pageId = PageID.WildCardPage,
}: AmityThumbnailActionComponentProps): React.JSX.Element => {
  const componentId = ComponentID.thumbnail_action;
  const { themeStyles } = useAmityComponent({ pageId, componentId });
  const styles = useStyles(themeStyles);

  return (
    <View style={styles.container}>
      <ChangeThumbnailButton
        componentId={componentId}
        onPress={onChangeThumbnail}
      />
      <DeleteThumbnailButton
        componentId={componentId}
        onPress={onDeleteThumbnail}
      />
    </View>
  );
};

export default AmityThumbnailActionComponent;
