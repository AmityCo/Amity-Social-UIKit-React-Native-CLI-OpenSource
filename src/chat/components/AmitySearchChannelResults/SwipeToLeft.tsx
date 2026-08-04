// SwipeToLeft — ported from AmityUiKitWeb v4/chat/components/SwipeToLeft.
// A row that reveals a single trailing action when swiped left; swiping past the
// threshold fires `onAction` and springs the row closed.
//
// The web parity manifest marks `chat/components/SwipeToLeft` as skip (legacy
// LiveChat gesture helper), so this is implemented locally as an internal helper
// of AmitySearchChannelResults rather than a shared unit.
//
// RN adaptations from web:
//   - framer-motion drag → react-native-gesture-handler's `Swipeable`
//     (`renderRightActions`): swiping the row left reveals the right action panel.
//     `onSwipeableOpen('right')` fires `onAction` then closes, mirroring web's
//     "trigger, then reset x to 0" behaviour.
//   - Web's `actionIcon` is an SVG component; RN takes an `AmityIconName`.
//   - The action panel's square-button secondary CSS tokens port 1:1 to the RN
//     SquareButton default-secondary tokens (surface/icon/text), matching the
//     sibling archive ArchivedChannelList.
//   - The swipe only responds when a `GestureHandlerRootView` is mounted at the
//     app root (host-app responsibility).

import { type ReactNode, useRef } from 'react';
import { View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { Typography } from '../../../core/design/components/Typography';
import { AmityIcon, type AmityIconName } from '../../../core/design/icons';
import { AmityColorToken } from '../../../core/design/tokens/amity-color-tokens';
import { useStyles } from './styles';

type SwipeToLeftProps = {
  children: ReactNode;
  actionLabel: string;
  actionIcon: AmityIconName;
  onAction: () => void;
};

// web SwipeToLeft.module.css: actionContent width 5rem, icon 1.75rem.
const ACTION_WIDTH = 80;
const ACTION_ICON_SIZE = 28;

export function SwipeToLeft({
  children,
  actionLabel,
  actionIcon,
  onAction,
}: SwipeToLeftProps) {
  const { styles, token } = useStyles();
  const swipeableRef = useRef<Swipeable>(null);

  function renderRightActions() {
    return (
      <View style={styles.swipeAction}>
        <View style={styles.swipeActionContent}>
          <AmityIcon
            name={actionIcon}
            size={ACTION_ICON_SIZE}
            tokenColor={AmityColorToken.IconSquareButtonDefaultSecondaryDefault}
          />
          <Typography variant="captionBold" style={styles.swipeActionLabel}>
            {actionLabel}
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={ACTION_WIDTH / 2}
      overshootRight={false}
      renderRightActions={renderRightActions}
      containerStyle={{
        backgroundColor: token(
          AmityColorToken.SurfaceSquareButtonDefaultSecondaryDefault
        ),
      }}
      childrenContainerStyle={{
        backgroundColor: token(AmityColorToken.SurfacePageBackgroundDefault),
      }}
      onSwipeableOpen={(direction) => {
        if (direction !== 'right') return;
        onAction();
        swipeableRef.current?.close();
      }}
    >
      {children}
    </Swipeable>
  );
}
