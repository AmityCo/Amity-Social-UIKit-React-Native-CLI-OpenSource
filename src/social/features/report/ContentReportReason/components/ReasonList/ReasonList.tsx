import { TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import type { ContentFlagReasonEnum } from '@amityco/ts-sdk-react-native';
import { Radio } from '../../../../../../core/components/Radio';
import { Typography } from '../../../../../../core/components/Typography/Typography';
import { arrowRight } from '../../../../../../core/assets/icons';
import type { ReportReasonOption } from '../../types';
import { useStyles } from './styles';

type ReasonListProps = {
  description: string;
  reasons: ReportReasonOption[];
  othersLabel: string;
  selectedReason?: ContentFlagReasonEnum;
  disabled?: boolean;
  onSelectReason: (reason: ContentFlagReasonEnum) => void;
  onPressOthers: () => void;
};

export function ReasonList({
  description,
  reasons,
  othersLabel,
  selectedReason,
  disabled,
  onSelectReason,
  onPressOthers,
}: ReasonListProps) {
  const { styles, theme } = useStyles();

  return (
    <View>
      <Typography.Caption style={styles.description}>
        {description}
      </Typography.Caption>
      <Radio.Group
        value={selectedReason}
        onChange={onSelectReason}
        disabled={disabled}
      >
        {reasons.map(({ value, label }) => (
          <Radio.Option key={value} value={value} accessibilityLabel={label}>
            <Radio.Label style={styles.label}>
              <Typography.BodyBold>{label}</Typography.BodyBold>
            </Radio.Label>
            <Radio.Icon />
          </Radio.Option>
        ))}
      </Radio.Group>
      <TouchableOpacity
        style={styles.othersRow}
        disabled={disabled}
        onPress={onPressOthers}
        accessibilityRole="button"
        accessibilityLabel={othersLabel}
      >
        <Typography.BodyBold style={styles.label}>
          {othersLabel}
        </Typography.BodyBold>
        <SvgXml
          xml={arrowRight()}
          width={24}
          height={24}
          color={theme.colors.base}
        />
      </TouchableOpacity>
    </View>
  );
}
