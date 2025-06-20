import React, { FC, memo } from 'react';
import { useStyle } from './styles';
import { View } from 'react-native';
import { Typography } from '../Typography/Typography';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';
import { SvgXml } from 'react-native-svg';
import { errorPage } from '../../assets/icons';
import Button, { BUTTON_SIZE } from '../Button/Button';

type ErrorComponentProps = {
  title: string;
  description?: string;
  themeStyle?: MyMD3Theme;
  icon?: () => string;
  onPress?: () => void;
};

const ErrorComponent: FC<ErrorComponentProps> = ({
  title,
  description,
  themeStyle,
  icon = errorPage,
  onPress,
}) => {
  const styles = useStyle(themeStyle);

  return (
    <View style={styles.container}>
      <SvgXml xml={icon()} />
      <View>
        <Typography.Headline style={styles.title}>{title}</Typography.Headline>
        {description && (
          <Typography.Caption style={styles.description}>
            {description}
          </Typography.Caption>
        )}
      </View>
      {onPress && (
        <Button
          type="primary"
          onPress={onPress}
          style={styles.button}
          themeStyle={themeStyle}
          size={BUTTON_SIZE.LARGE}
        >
          Go back
        </Button>
      )}
    </View>
  );
};

export default memo(ErrorComponent);
