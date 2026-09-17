// useChatSurfaceHeight — the height of the box a chat page actually occupies,
// published to anything inside it that has to size against the page rather than
// against the device.
//
// The case that needs it is the report reason sheet. @devvie/bottom-sheet reads
// `height="90%"` against `containerHeight`, and its default for that is
// `Dimensions.get('window').height` — the DEVICE screen. A host app that mounts
// the UIKit under its own chrome (the example app's module nav header) leaves
// the page a smaller box, so 90% of the screen is more than 90% of the page and
// the sheet all but covers the chat header behind it (PDT-5225).
//
// Why the page and not the sheet
// ------------------------------
// Measuring from inside the sheet was tried three ways and failed three ways:
// a live measurement feeds the library a new height mid-drag and the sheet runs
// off the top; freezing the first reading locks in whatever layout happened to
// be mid-flight; and tracking the largest reading latches onto any single frame
// that measured the full window. The box is simply not stable when observed
// from a view that is itself animating inside it.
//
// The page's own frame is. It settles once on navigation, long before a sheet
// can open, and nothing inside the page changes it.
//
// Why the largest reading still
// -----------------------------
// Android resizes the window for the keyboard (`adjustResize`), so the page
// shrinks by the keyboard's height while one is open. The box we want is the
// page at rest, which is the largest the page has been. Mounting with a
// keyboard already up reads short, then corrects itself the moment it closes.

// 1. React / RN imports
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { View, type LayoutChangeEvent } from 'react-native';

// 2. Internal imports (relative)
import { useStyles } from './useChatSurfaceHeight.styles';

const ChatSurfaceHeightContext = createContext<number | undefined>(undefined);

/**
 * Height in dp of the chat page this component sits in, or `undefined` until
 * the page has been laid out once.
 */
export function useChatSurfaceHeight() {
  return useContext(ChatSurfaceHeightContext);
}

type ChatSurfaceProps = {
  children: ReactNode;
};

/**
 * Wraps a chat page's content, measures the box it fills, and publishes it.
 *
 * Mount it directly inside the page's SafeAreaView and OUTSIDE anything that
 * avoids the keyboard — a keyboard-avoiding wrapper gives up height while the
 * keyboard is open, which is exactly the reading we do not want.
 */
export function ChatSurface({ children }: ChatSurfaceProps) {
  const { styles } = useStyles();
  const [surfaceHeight, setSurfaceHeight] = useState<number>();

  const measureSurface = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;

    // A measurement taken mid-teardown reads as zero and proves nothing.
    if (height === 0) return;

    setSurfaceHeight((current) =>
      current == null || height > current ? height : current
    );
  }, []);

  return (
    <View style={styles.surface} onLayout={measureSurface}>
      <ChatSurfaceHeightContext.Provider value={surfaceHeight}>
        {children}
      </ChatSurfaceHeightContext.Provider>
    </View>
  );
}
