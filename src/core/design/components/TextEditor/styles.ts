// Styles for the RN TextEditor. Geometry mirrors the composer input surface
// (web MessageComposer.module.css): radius 1.25rem→20, padding 0.625rem 0.75rem
// →10/12, min-height 2.5rem→40, editor font 1rem/1.25rem→16/20. All colours
// resolve through design tokens.

import { StyleSheet } from 'react-native';
import { useToken } from '../../theme/useToken';
import { AmityColorToken } from '../../tokens/amity-color-tokens';

export const useStyles = () => {
  const token = useToken();

  const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      minWidth: 0,
      backgroundColor: token(AmityColorToken.SurfaceInputBoxedInputDefault),
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 12,
      minHeight: 40,
      justifyContent: 'center',
    },
    // No `flex` here: the input height is driven explicitly from content size
    // (TextEditor auto-grow) so the boxed wrapper can grow line-by-line up to
    // maxHeight, then the input scrolls. A vertical flex would fight that height.
    input: {
      fontSize: 16,
      lineHeight: 20,
      padding: 0,
      textAlignVertical: 'top',
      // Web composer editor uses text-input-textinput-placeholder-enabled-filled for
      // typed text; that token flips (dark-grey in light mode, white in dark). Its RN
      // path is ".../Placeholder/Enabled-Filled" (Enabled-Filled is ONE hyphenated
      // segment — guessing "Enabled/Filled" resolves to the missing sentinel).
      color: token(AmityColorToken.TextInputTextInputPlaceholderEnabledFilled),
    },
    // Inserted mention token — the editor highlight colour, at the same semibold
    // weight a mention carries once the message is sent, so picking a name does
    // not change how it reads between the composer and the bubble.
    //
    // Must repeat the input's fontSize/lineHeight: a nested <Text> inside a
    // TextInput does NOT reliably inherit the parent's lineHeight on Android, so
    // without these it renders at the font's natural (taller) line height and its
    // bottom gets clipped by the 20px line box sized from the surrounding text.
    // The heavier weight makes that natural line height taller still, so the two
    // values have to stay pinned to the input's.
    mention: {
      color: token(
        AmityColorToken.TextInputTextInputPlaceholderEnabledHighlight
      ),
      fontSize: 16,
      lineHeight: 20,
      // '600' rather than '500': Android resolves no Medium face for the numeric
      // weight and falls back to regular, which erases the emphasis entirely.
      fontWeight: '600',
    },
  });

  const placeholderColor = token(
    AmityColorToken.TextInputTextInputPlaceholderEnabled
  );

  return { styles, token, placeholderColor };
};
