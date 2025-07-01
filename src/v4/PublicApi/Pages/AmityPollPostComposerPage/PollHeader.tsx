import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import close from '../../../assets/icons/close';
import { Typography } from '../../../component/Typography/Typography';
import { useStyles } from './styles';

type PollHeaderProps = {
  goBack: () => void;
  targetName: string;
  isBtnDisable: boolean;
  handleCreatePost: () => void;
};
export function PollHeader({
  goBack,
  targetName,
  isBtnDisable,
  handleCreatePost,
}: PollHeaderProps) {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={goBack}>
        <SvgXml
          width="24"
          height="24"
          xml={close()}
          color={theme.colors.base}
        />
      </TouchableOpacity>
      <View style={styles.title}>
        <Typography.TitleBold style={styles.base}>
          {targetName}
        </Typography.TitleBold>
      </View>
      <TouchableOpacity disabled={isBtnDisable} onPress={handleCreatePost}>
        <Typography.Body style={[styles.cta, isBtnDisable && styles.disabled]}>
          Post
        </Typography.Body>
      </TouchableOpacity>
    </View>
  );
}
