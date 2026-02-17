import React from 'react';
import { View } from 'react-native';
import { useStyles } from './styles';
import { Radio } from '../../../../../../core/components/Radio';
import { ElementID, PageID } from '../../../../../enums';
import FormLabel from '../../../../../elements/FormLabel';
import { AmityCommunityPrivacyEnum } from '../../types';
import {
  public as $public,
  private as $private,
} from '../../../../../../core/assets/icons';
import { Title } from '../../../../../elements';
import FormDescription from '../../../../../elements/FormDescription';
import CommunityPrivacyIcon from '../../../../../elements/CommunityPrivacyIcon';

type PrivacyProps = {
  value: AmityCommunityPrivacyEnum;
  onChange: (value: AmityCommunityPrivacyEnum) => void;
};

function Privacy({ value, onChange }: PrivacyProps) {
  const { styles } = useStyles();

  return (
    <View
      style={[
        styles.container,
        value === AmityCommunityPrivacyEnum.PRIVATE && styles.containerBorder,
      ]}
    >
      <FormLabel
        pageId={PageID.community_setup_page}
        elementId={ElementID.community_privacy_title}
      />
      <Radio.Group value={value} onChange={onChange}>
        <Radio.Option
          style={() => styles.optionContainer}
          value={AmityCommunityPrivacyEnum.PUBLIC}
          accessibilityLabel={AmityCommunityPrivacyEnum.PUBLIC}
        >
          <Radio.Label style={styles.labelContainer}>
            <CommunityPrivacyIcon
              iconProps={{ xml: $public() }}
              pageId={PageID.community_setup_page}
              elementId={ElementID.community_privacy_public_icon}
            />
            <View style={styles.infoContainer}>
              <Title
                variant="body"
                style={styles.title}
                pageId={PageID.community_setup_page}
                elementId={ElementID.community_privacy_public_title}
              />
              <FormDescription
                style={styles.description}
                pageId={PageID.community_setup_page}
                elementId={ElementID.community_privacy_public_description}
              />
            </View>
          </Radio.Label>
          <Radio.Icon />
        </Radio.Option>
        <Radio.Option
          style={() => styles.optionContainer}
          value={AmityCommunityPrivacyEnum.PRIVATE}
          accessibilityLabel={AmityCommunityPrivacyEnum.PRIVATE}
        >
          <Radio.Label style={styles.labelContainer}>
            <CommunityPrivacyIcon
              iconProps={{ xml: $private() }}
              pageId={PageID.community_setup_page}
              elementId={ElementID.community_privacy_private_icon}
            />
            <View style={styles.infoContainer}>
              <Title
                variant="body"
                style={styles.title}
                pageId={PageID.community_setup_page}
                elementId={ElementID.community_privacy_private_title}
              />
              <FormDescription
                style={styles.description}
                pageId={PageID.community_setup_page}
                elementId={ElementID.community_privacy_private_description}
              />
            </View>
          </Radio.Label>
          <Radio.Icon />
        </Radio.Option>
      </Radio.Group>
    </View>
  );
}

export default Privacy;
