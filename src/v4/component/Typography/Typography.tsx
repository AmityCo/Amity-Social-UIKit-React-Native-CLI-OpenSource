import React from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';
import { styles } from './styles';

type TypographyProps = TextProps & {
  style?: StyleProp<TextStyle>;
};

export function Typography({ children, style, ...props }: TypographyProps) {
  return (
    <Text style={style} {...props}>
      {children}
    </Text>
  );
}

Typography.Headline = function ({ style, ...props }: TypographyProps) {
  return <Typography style={[styles.typography__headline, style]} {...props} />;
};

Typography.TitleBold = function ({ style, ...props }: TypographyProps) {
  return (
    <Typography style={[styles.typography__titleBold, style]} {...props} />
  );
};

Typography.Title = function ({ style, ...props }: TypographyProps) {
  return <Typography style={[styles.typography__title, style]} {...props} />;
};

Typography.BodyBold = function ({ style, ...props }: TypographyProps) {
  return <Typography style={[styles.typography__bodyBold, style]} {...props} />;
};

Typography.Body = function ({ style, ...props }: TypographyProps) {
  return <Typography style={[styles.typography__body, style]} {...props} />;
};

Typography.CaptionBold = function ({ style, ...props }: TypographyProps) {
  return (
    <Typography style={[styles.typography__captionBold, style]} {...props} />
  );
};

Typography.Caption = function ({ style, ...props }: TypographyProps) {
  return <Typography style={[styles.typography__caption, style]} {...props} />;
};

Typography.CaptionSmall = function ({ style, ...props }: TypographyProps) {
  return (
    <Typography style={[styles.typography__captionSmall, style]} {...props} />
  );
};
