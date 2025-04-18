import React, { FC, memo } from 'react';
import { useStyle } from './styles';
import { View } from 'react-native';
import { Typography } from '../Typography/Typography';
import { MyMD3Theme } from '../../../providers/amity-ui-kit-provider';
import { SvgXml } from 'react-native-svg';
import { errorPage } from '../../assets/icons';

type ErrorComponentProps = {
  title: string;
  description?: string;
  themeStyle?: MyMD3Theme;
  // icon is a function that returns a svg string
  icon?: () => string;
};

const ErrorComponent: FC<ErrorComponentProps> = ({
  title,
  description,
  themeStyle,
  icon = errorPage,
}) => {
  const styles = useStyle(themeStyle);

  return (
    <View style={styles.container}>
      <SvgXml xml={icon()} />
      <View>
        <Typography.TitleBold style={styles.title}>
          {title}
        </Typography.TitleBold>
        {description && (
          <Typography.Caption style={styles.description}>
            {description}
          </Typography.Caption>
        )}
      </View>
    </View>
  );
};

export default memo(ErrorComponent);
