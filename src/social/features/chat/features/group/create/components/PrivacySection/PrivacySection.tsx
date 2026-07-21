// PrivacySection — the public/private chooser on the create-group screen. Ported
// from AmityUiKitWeb v4/chat/features/group/create/components/PrivacySection. Two
// radio rows (each an icon circle + title + description) and a warning banner.
//
// RN adaptations from web:
//   - Web's `Selection.RadioGroup` (react-aria) has no RN wrapper; each option is
//     an individual `Selection.Radio` (isSelected/onSelect) with group state owned
//     here. `EarthAfrica.Solid`→`earth-africa-s`; `LockKeyhole`→`lock-keyhole-r`.

// 1. React / RN imports
import { type ReactNode } from 'react';
import { View } from 'react-native';

// 2. Internal imports (relative)
import { Selection } from '../../../../../../../../core/design/atoms/Selection';
import { Typography } from '../../../../../../../../core/design/components/Typography';
import { AmityIcon } from '../../../../../../../../core/design/icons';
import { AmityColorToken } from '../../../../../../../../core/design/tokens/amity-color-tokens';
import { useString } from '../../../../../../../../core/localization';
import { useStyles } from './styles';

// 3. Types
type PrivacySectionProps = {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
};

// 4. Named function component
export function PrivacySection({ isPublic, onChange }: PrivacySectionProps) {
  const { styles } = useStyles();
  const privacyLabel = useString('amity_chat_privacy_label');
  const publicTitle = useString('amity_chat_create_group_public_title');
  const publicDesc = useString('amity_chat_create_group_public_subtitle');
  const privateTitle = useString('amity_chat_create_group_private_title');
  const privateDesc = useString('amity_chat_create_group_private_subtitle');
  const privacyWarning = useString('amity_chat_privacy_warning');

  return (
    <View style={styles.privacySection}>
      <Typography variant="titleBold" style={styles.heading}>
        {privacyLabel}
      </Typography>
      <View style={styles.options}>
        <View style={styles.optionRow}>
          <Selection.Radio
            isSelected={isPublic}
            onSelect={() => onChange(true)}
            accessibilityLabel={publicTitle}
          >
            <PrivacyRow
              icon={
                <AmityIcon
                  name="earth-africa-s"
                  size={24}
                  tokenColor={AmityColorToken.IconFeaturedIconTinted}
                />
              }
              title={publicTitle}
              description={publicDesc}
            />
          </Selection.Radio>
        </View>
        <View style={styles.optionRow}>
          <Selection.Radio
            isSelected={!isPublic}
            onSelect={() => onChange(false)}
            accessibilityLabel={privateTitle}
          >
            <PrivacyRow
              icon={
                <AmityIcon
                  name="lock-keyhole-r"
                  size={24}
                  tokenColor={AmityColorToken.IconFeaturedIconTinted}
                />
              }
              title={privateTitle}
              description={privateDesc}
            />
          </Selection.Radio>
        </View>
      </View>
      <View style={styles.banner}>
        <Typography variant="caption" style={styles.bannerText}>
          {privacyWarning}
        </Typography>
      </View>
    </View>
  );
}

// 5. Sub-component — an icon circle beside a title + description.
type PrivacyRowProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function PrivacyRow({ icon, title, description }: PrivacyRowProps) {
  const { styles } = useStyles();
  return (
    <View style={styles.row}>
      <View style={styles.iconCircle}>{icon}</View>
      <View style={styles.text}>
        <Typography variant="bodyBold" style={styles.title}>
          {title}
        </Typography>
        <Typography variant="caption" style={styles.description}>
          {description}
        </Typography>
      </View>
    </View>
  );
}

// 6. Compound variant — mirrors web's `PrivacySection.Row`.
PrivacySection.Row = PrivacyRow;
