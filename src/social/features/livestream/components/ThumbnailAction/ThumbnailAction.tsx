import { View } from 'react-native';
import { ComponentID, PageID } from '../../../../enums/enumUIKitID';
import { useAmityComponent } from '../../../../hooks';
import { ChangeThumbnailButton } from '../../../../elements/ChangeThumbnailButton';
import { DeleteThumbnailButton } from '../../../../elements/DeleteThumbnailButton';
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
