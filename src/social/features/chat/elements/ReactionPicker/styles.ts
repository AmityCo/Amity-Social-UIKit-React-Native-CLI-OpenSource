// Styles for ReactionPicker — ported from AmityUiKitWeb
// v4/chat/elements/ReactionPicker/ReactionPicker.module.css PLUS the pill
// wrapper web keeps in MessageActionsPopover.module.css
// (`.messageActionsPopover__reactionPicker`: filled-default surface, full radius,
// box-shadow-04). The wrapper is folded in here so the component is a drop-in
// for the RN action menu — mounting it closes web's reactionpopover-filled-default
// gap. Orchestrator MUST NOT double-wrap it in another pill.
// rem→px ×16.

import { StyleSheet } from 'react-native';
import { useToken } from '../../../../../core/design/theme/useToken';
import { AmityColorToken } from '../../../../../core/design/tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    // .messageActionsPopover__reactionPicker (the filled pill)
    pill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 9999,
      backgroundColor: token(
        AmityColorToken.SurfaceReactionsReactionPopoverFilledDefault
      ),
      // web box-shadow: 0 0.25rem 1rem rgb(0 0 0 / 12%)
      shadowColor: 'rgb(0,0,0)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    // .reactionPickerContainer
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    // .reactionButton (2rem × 2rem)
    reactionButton: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
    },
    // .reactionButton__activeBackground
    activeBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 32,
      height: 32,
      borderRadius: 9999,
      backgroundColor: token(
        AmityColorToken.SurfaceReactionsReactionPopoverReactionStateActive
      ),
    },
    // .reactionButton__text (floating label tooltip)
    label: {
      position: 'absolute',
      top: -33,
      alignSelf: 'center',
      maxWidth: 64,
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 28,
      backgroundColor: token(
        AmityColorToken.SurfaceReactionsReactionPopoverReactionNameActive
      ),
      zIndex: 2,
    },
    labelText: {
      textTransform: 'capitalize',
      textAlign: 'center',
      color: token(
        AmityColorToken.TextReactionsReactionPopoverReactionNameGeneral
      ),
    },
  });

  return { styles };
};
