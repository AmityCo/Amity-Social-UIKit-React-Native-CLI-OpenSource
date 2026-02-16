import React from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';
import { useStyles } from './styles';

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

function Headline({ style, ...props }: TypographyProps) {
  const { styles } = useStyles();
  return <Typography style={[styles.typography__headline, style]} {...props} />;
}

function TitleBold({ style, ...props }: TypographyProps) {
  const { styles } = useStyles();
  return (
    <Typography style={[styles.typography__titleBold, style]} {...props} />
  );
}

function Title({ style, ...props }: TypographyProps) {
  const { styles } = useStyles();
  return <Typography style={[styles.typography__title, style]} {...props} />;
}

function BodyBold({ style, ...props }: TypographyProps) {
  const { styles } = useStyles();
  return <Typography style={[styles.typography__bodyBold, style]} {...props} />;
}

function Body({ style, ...props }: TypographyProps) {
  const { styles } = useStyles();
  return <Typography style={[styles.typography__body, style]} {...props} />;
}

function CaptionBold({ style, ...props }: TypographyProps) {
  const { styles } = useStyles();
  return (
    <Typography style={[styles.typography__captionBold, style]} {...props} />
  );
}

function Caption({ style, ...props }: TypographyProps) {
  const { styles } = useStyles();
  return <Typography style={[styles.typography__caption, style]} {...props} />;
}

function CaptionSmall({ style, ...props }: TypographyProps) {
  const { styles } = useStyles();
  return (
    <Typography style={[styles.typography__captionSmall, style]} {...props} />
  );
}
Typography.Headline = Headline;

Typography.TitleBold = TitleBold;

Typography.Title = Title;

Typography.BodyBold = BodyBold;

Typography.Body = Body;

Typography.CaptionBold = CaptionBold;

Typography.Caption = Caption;

Typography.CaptionSmall = CaptionSmall;
