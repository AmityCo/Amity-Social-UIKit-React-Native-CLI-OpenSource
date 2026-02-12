import { Image, Text, TouchableOpacity } from 'react-native';
import React, { memo } from 'react';
import useFile from '../../../core/hooks/useFile';
import { SvgXml } from 'react-native-svg';
import { categoryIcon } from '../../../core/assets/icons/xml';
import { useStyle } from '../styles';

const Categories = ({
  item,
  onSelectCategory,
}: {
  item: Amity.Category;
  onSelectCategory: (id: string, name: string) => void;
}) => {
  const avatarURL = useFile({ fileId: item.avatarFileId });
  const styles = useStyle();
  return (
    <TouchableOpacity
      onPress={() => onSelectCategory(item.categoryId, item.name)}
      style={styles.rowContainer}
    >
      {item.avatarFileId ? (
        <Image
          style={styles.avatar}
          source={{
            uri: avatarURL,
          }}
        />
      ) : (
        <SvgXml xml={categoryIcon} width={40} height={40} />
      )}

      <Text style={styles.communityText}>{item.name}</Text>
    </TouchableOpacity>
  );
};

export default memo(Categories);
