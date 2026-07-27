import {
  AmityUiKitProvider,
  AmityUiKitSocial,
  AmityCreateProfilePage,
  AmityPageRenderer,
} from '@amityco/react-native-social-uikit';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import config from '../uikit.config.json';
// ⚠️ TEST ONLY — remove with example/src/testAuth.ts before shipping.
import { makeTestGetAuthToken, makeTestEnrollProfile } from './testAuth';

type VisitorScreenProps = {
  apiKey: string;
  apiRegion: string;
  apiEndpoint: string;
  fcmToken?: string;
};

/** Which view the visitor is currently looking at. */
type ViewName = 'social' | 'createProfile';

const GUIDELINES = [
  {
    title: 'Privacy and Safety',
    body: "Keep your personal details private and respect others' privacy. Report anything that feels unsafe.",
  },
  {
    title: 'Content Standards',
    body: 'Share helpful, positive, and relevant content. No spam, self-promotion, or inappropriate posts.',
  },
  {
    title: 'Moderation',
    body: 'Our moderators help keep this space respectful. Posts that break the rules will be removed.',
  },
  {
    title: 'Engagement',
    body: 'Share insights, celebrate others, and keep the community inspiring for all travelers.',
  },
];

/**
 * Community guidelines modal shown when a visitor attempts a gated action.
 * Mirrors the Web "Welcome to the new Community" design: a list of guidelines,
 * a Terms-of-use checkbox gating the primary button, and an X to dismiss.
 */
function GuidelinesModal({
  visible,
  onClose,
  onJoin,
}: {
  visible: boolean;
  onClose: () => void;
  onJoin: () => void;
}) {
  const [agreed, setAgreed] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <TouchableOpacity
            accessibilityLabel="Close"
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>
              Welcome to the new{' '}
              <Text style={styles.titleAccent}>Community</Text> in town and at
              sea!
            </Text>
            <Text style={styles.subtitle}>
              To keep the community welcoming and inspiring, please review and
              follow these simple guidelines:
            </Text>

            <View style={styles.guidelineList}>
              {GUIDELINES.map((g) => (
                <View key={g.title} style={styles.guidelineRow}>
                  <View style={styles.checkIcon}>
                    <Text style={styles.checkIconText}>✓</Text>
                  </View>
                  <View style={styles.guidelineTextWrap}>
                    <Text style={styles.guidelineTitle}>{g.title}</Text>
                    <Text style={styles.guidelineBody}>{g.body}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.termsRow}
              activeOpacity={0.7}
              onPress={() => setAgreed((v) => !v)}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I have read and agree to the{' '}
                <Text style={styles.link}>Terms of use</Text> and{' '}
                <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!agreed}
              onPress={onJoin}
              style={[styles.joinButton, !agreed && styles.joinButtonDisabled]}
            >
              <Text style={styles.joinButtonText}>Join & Create profile</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Visitor-mode flow.
 *
 * The provider is mounted WITHOUT a `userId`, so the user starts as an
 * anonymous visitor (AmityUiKitProvider calls Client.loginAsVisitor).
 *
 * Flow:
 * 1. Default: browse the app via `AmityUiKitSocial`.
 * 2. When the visitor attempts a gated action, the UIKit fires
 *    `handleVisitorUserAction` -> we open the community guidelines modal.
 * 3. "Join & Create profile" -> render `AmityCreateProfilePage`.
 * 4. `onCancel` from the create-profile page -> back to `AmityUiKitSocial`.
 */
export default function VisitorScreen({
  apiKey,
  apiRegion,
  apiEndpoint,
  fcmToken,
}: VisitorScreenProps) {
  // ⚠️ TEST ONLY — remove with example/src/testAuth.ts before shipping.
  // enrollProfile mocks the host's `POST /community/enrollment`: on Save it
  // creates the user server-side and returns the communityId (used as userId).
  // getAuthToken then mints the secure-mode token for that communityId — the
  // page chains them: enrollProfile -> getAuthToken(communityId) -> Client.login.
  const enrollProfile = makeTestEnrollProfile();
  const getAuthToken = makeTestGetAuthToken(apiRegion);

  const [view, setView] = useState<ViewName>('social');
  const [showGuidelines, setShowGuidelines] = useState(false);
  // The signed-in identity. Empty while in visitor mode; set after the profile
  // is created. Passing `userId` to the provider switches it from a visitor
  // session to a normal signed-in login (the provider re-logs-in when `userId`
  // changes).
  const [authUserId, setAuthUserId] = useState<string>();
  const [authDisplayName, setAuthDisplayName] = useState<string>();

  return (
    // No `userId` -> visitor mode. Once `authUserId` is set, the provider
    // re-logs-in as that signed-in user.
    <AmityUiKitProvider
      apiKey={apiKey}
      apiRegion={apiRegion}
      apiEndpoint={apiEndpoint}
      displayName={authDisplayName}
      // Cast: node_modules has two copies of the config type, so the JSON's
      // inferred type and the provider's expected type are nominally distinct.
      configs={config as any}
      // Secure mode: once `authUserId` is set, the provider re-logs-in as that
      // signed-in user and mints its token via getAuthToken(userId). (No effect
      // while in visitor mode — loginAsVisitor takes no token.)
      getAuthToken={getAuthToken}
      fcmToken={fcmToken}
      behaviour={{
        AmityGlobalBehavior: {
          // Visitor tried a gated action -> show the guidelines modal.
          handleVisitorUserAction: () => {
            setShowGuidelines(true);
          },
        },
      }}
    >
      <View style={styles.root}>
        {view === 'createProfile' ? (
          // Standalone pages must be wrapped in AmityPageRenderer so they get a
          // navigation context; without it the page throws a navigation error.
          // (AmityUiKitSocial below has its own navigator, so it isn't wrapped.)
          <AmityPageRenderer>
            <AmityCreateProfilePage
              // Server-to-server enrollment: on Save the page calls enrollProfile
              // (host backend) to create the user and get its communityId, then
              // getAuthToken(communityId) to mint the secure-mode token, then
              // Client.login. getAuthToken is inherited from the provider, but we
              // pass it here too to keep this page self-contained.
              enrollProfile={enrollProfile}
              getAuthToken={getAuthToken}
              onCreated={({ userId, displayName, about, imageUrl }) => {
                // Save succeeded. The page already ran Client.login internally;
                // passing the returned userId + displayName to the provider
                // re-runs its login so the app renders as this signed-in user
                // instead of a visitor. `about` is the entered description and
                // `imageUrl` is the uploaded avatar's file URL, if set.
                console.log('Profile created:', { about, imageUrl });
                setAuthUserId(userId);
                setAuthDisplayName(displayName);
                setView('social');
              
              }}
       
              onCancel={() => {
                // Dismiss create-profile -> back to the social app.
                setView('social');
              }}
              
            />
          </AmityPageRenderer>
        ) : (
          // Key by auth state so the social tree remounts on login. The UIKit's
          // layout picks its default tab once on mount (visitor -> Communities,
          // signed-in -> Newsfeed); without the remount a user who started as a
          // visitor would stay stuck on the Communities tab after logging in.
          <AmityUiKitSocial key={authUserId ? 'signedIn' : 'visitor'} />
        )}
      </View>

      <GuidelinesModal
        visible={showGuidelines}
        onClose={() => setShowGuidelines(false)}
        onJoin={() => {
          setShowGuidelines(false);
          setView('createProfile');
        }}
      />
    </AmityUiKitProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingTop: 40,
    paddingBottom: 28,
    paddingHorizontal: 28,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
    padding: 4,
  },
  closeIcon: {
    fontSize: 20,
    color: '#1054de',
    lineHeight: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#17181c',
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 30,
  },
  titleAccent: {
    color: '#1054de',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#898e9e',
    marginBottom: 24,
    lineHeight: 20,
  },
  guidelineList: {
    marginBottom: 24,
  },
  guidelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#12824b',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 12,
  },
  checkIconText: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 14,
  },
  guidelineTextWrap: {
    flex: 1,
  },
  guidelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#17181c',
    marginBottom: 2,
  },
  guidelineBody: {
    fontSize: 13,
    color: '#636878',
    lineHeight: 19,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#898e9e',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#1054de',
    borderColor: '#1054de',
  },
  checkboxTick: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 14,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#636878',
    lineHeight: 19,
  },
  link: {
    color: '#1054de',
    fontWeight: '600',
  },
  joinButton: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#1b3a6b',
    alignItems: 'center',
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
