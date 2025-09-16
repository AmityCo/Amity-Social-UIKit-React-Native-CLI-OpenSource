import React from 'react';
import { useStyles } from './styles';
import { useAmityElement } from '~/v4/hook';
import { arrowRight } from '~/v4/assets/icons';
import { SvgXml, XmlProps } from 'react-native-svg';
import { ComponentID, ElementID, PageID } from '~/v4/enum';
import { Typography } from '~/v4/component/Typography/Typography';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

type ActionProps = TouchableOpacityProps & {
  pageId?: PageID;
  componentId?: ComponentID;
  elementId?: ElementID;
  iconProps?: Pick<XmlProps, 'width' | 'height' | 'color' | 'xml'> & {
    noContainer?: boolean;
  };
  description?: string;
  label?: string;
};

function Action({
  iconProps,
  description,
  pageId = PageID.WildCardPage,
  componentId = ComponentID.WildCardComponent,
  elementId = ElementID.WildCardElement,
  label,
  ...props
}: ActionProps) {
  const { themeStyles, isExcluded, accessibilityId, config } = useAmityElement({
    pageId,
    componentId,
    elementId,
  });
  const { theme, styles } = useStyles(themeStyles);

  if (isExcluded) return null;

  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      testID={accessibilityId}
      {...props}
    >
      <View style={styles.labelContainer}>
        {iconProps.noContainer ? (
          <SvgXml
            width={24}
            height={20}
            color={theme.colors.base}
            {...iconProps}
          />
        ) : (
          <View style={styles.iconContainer}>
            <SvgXml
              width={24}
              height={20}
              color={theme.colors.base}
              {...iconProps}
            />
          </View>
        )}
        <Typography.Body>{label ?? (config?.text as string)}</Typography.Body>
      </View>
      <View style={styles.labelContainer}>
        {description && (
          <Typography.Body style={styles.baseShade1Text}>
            {description}
          </Typography.Body>
        )}
        <SvgXml
          width={24}
          height={24}
          xml={arrowRight()}
          color={theme.colors.baseShade1}
        />
      </View>
    </TouchableOpacity>
  );
}

export default Action;
