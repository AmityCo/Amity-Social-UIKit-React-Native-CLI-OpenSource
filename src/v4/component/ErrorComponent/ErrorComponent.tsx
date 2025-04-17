import React, { FC, memo } from 'react';
import { useStyle } from './styles';
import { View } from 'react-native';
import { Typography } from '../Typography/Typography';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';
import { SvgXml } from 'react-native-svg';
import { errorPage } from '../../assets/icons';

type ErrorComponentProps = {
  title?: string;
  description?: string;
  themeStyle?: MyMD3Theme;
};

const ErrorComponent: FC<ErrorComponentProps> = ({
  title = 'Something went wrong',
  description = 'Please try again.',
  themeStyle,
}) => {
  const styles = useStyle(themeStyle);

  return (
    <View style={styles.container}>
      <SvgXml xml={errorPage()} />
      <View>
        <Typography.TitleBold style={styles.title}>
          {title}
        </Typography.TitleBold>
        <Typography.Caption style={styles.description}>
          {description}
        </Typography.Caption>
      </View>
    </View>
  );
};

export default memo(ErrorComponent);
