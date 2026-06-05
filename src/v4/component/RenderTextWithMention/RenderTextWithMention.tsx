import { Text, Linking, TouchableOpacity } from 'react-native';
import { useStyles } from './styles';
import React, { memo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { IMentionPosition } from '../../types/type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes/RouteParamList';
import ReadMore from '@fawazahmed/react-native-read-more';
import { URL_REGEX } from '../../../v4/constants';

interface IrenderTextWithMention {
  mentionPositionArr: IMentionPosition[];
  textPost: string;
  isTitle?: boolean;
}

interface LinkInfo {
  link: string;
  index: number;
  length: number;
}

const RenderTextWithMention: React.FC<IrenderTextWithMention> = ({
  mentionPositionArr,
  textPost,
  isTitle,
}) => {
  const styles = useStyles();
  const navigation =
    useNavigation() as NativeStackNavigationProp<RootStackParamList>;
  const linkArr = useCallback((text: string): LinkInfo[] => {
    const links: LinkInfo[] = [];
    let match;
    while ((match = URL_REGEX.exec(text)) !== null) {
      links.push({
        link: match[0],
        index: match.index,
        length: match[0].length,
      });
    }
    return links;
  }, []);

  const heightlightTextPositions = [
    ...linkArr(textPost),
    ...mentionPositionArr,
  ].sort((a, b) => a.index - b.index) as (IMentionPosition & LinkInfo)[];

  const mentionClick = useCallback(
    (userId: string) => {
      navigation.navigate('UserProfile', {
        userId: userId,
      });
    },
    [navigation]
  );
  const handleLinkClick = useCallback(async (url: string) => {
    try {
      const hasProtocol = /^(https?|ftp|mailto):/.test(url);
      const formattedUrl = hasProtocol ? url : `https://${url}`;
      await Linking.openURL(formattedUrl);
    } catch (error) {
      console.warn('Failed to open URL:', error);
    }
  }, []);

  const handleOnClick = useCallback(
    (link: string, userId: string) => {
      if (link) return handleLinkClick(link);
      return mentionClick(userId);
    },
    [handleLinkClick, mentionClick]
  );

  if (heightlightTextPositions.length === 0) {
    return (
      <ReadMore
        key={textPost}
        numberOfLines={8}
        seeMoreStyle={styles.moreLessButton}
        style={[styles.inputText, isTitle && styles.bold]}
        seeLessStyle={styles.moreLessButton}
        seeLessText=""
      >
        {textPost}
      </ReadMore>
    );
  }

  let currentPosition = 0;
  const result: (string | React.ReactElement)[][] =
    heightlightTextPositions.map(({ index, length, userId, link }, i) => {
      // Add non-highlighted text before the mention
      const nonHighlightedText = textPost.slice(currentPosition, index);
      // Add highlighted text
      const highlightedText = (
        <TouchableOpacity
          onPress={() => handleOnClick(link, userId)}
          key={`highlighted-${i}`}
        >
          <Text style={styles.mentionText} selectable>
            {textPost.slice(index, index + length)}
          </Text>
        </TouchableOpacity>
      );

      // Update currentPosition for the next iteration
      currentPosition = index + length;

      // Return an array of non-highlighted and highlighted text
      return [nonHighlightedText, highlightedText];
    });

  // Add any remaining non-highlighted text after the mentions
  const remainingText = textPost.slice(currentPosition);
  result.push([
    <Text
      selectable
      key="nonHighlighted-last"
      style={[styles.inputText, isTitle && styles.bold]}
    >
      {remainingText}
    </Text>,
  ]);

  // Flatten the array and render
  return (
    <Text selectable style={[styles.inputText, isTitle && styles.bold]}>
      {result.flat()}
    </Text>
  );
};

export default memo(RenderTextWithMention);
