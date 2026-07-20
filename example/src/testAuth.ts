// ⚠️ TEST ONLY — REMOVE BEFORE SHIPPING. ⚠️
//
// Shared secure-mode test helpers used by SignedInScreen and VisitorScreen to
// exercise the `getAuthToken` (and `generateUserId`) flow end-to-end.
//
// A real integration would call YOUR backend to mint the auth token so the
// Server Key never lives in the app. Here we call the social.plus auth-token
// endpoint directly with a hardcoded Server Key purely to test the flow.
// Response is text/plain (the raw token, wrapped in double quotes).

const TEST_SERVER_KEY =
  'SERVER_KEY';

/**
 * Returns a `getAuthToken(userId)` for the given region. Mints a short-lived
 * secure-mode auth token by POSTing the userId to the auth-token endpoint with
 * the Server Key. In production this call lives on YOUR backend.
 */
export const makeTestGetAuthToken =
  (apiRegion: string) =>
  async (userId: string): Promise<string> => {
    const res = await fetch(
      `https://apix.${apiRegion}.amity.co/api/v4/authentication/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-server-key': TEST_SERVER_KEY,
        },
        body: JSON.stringify({ userId }),
      }
    );
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`getAuthToken failed (${res.status}): ${errText}`);
    }
    // 200 response is text/plain — the token IS the raw body (not JSON), and it
    // comes back wrapped in double quotes ("token"), so strip them.
    const authToken = (await res.text()).trim().replace(/^"|"$/g, '');
    console.log('[getAuthToken] minted token for', userId, '->', authToken);
    return authToken;
  };

/**
 * Mock `generateUserId` that mimics a real host API: it takes the entered
 * profile data, waits like a network round-trip, and returns a userId derived
 * from the displayName (deterministic so re-saving hits the same account).
 *
 * This mirrors the real contract: the userId does NOT exist until Save, which
 * is exactly why `getAuthToken` must be a callback — the token can only be
 * minted after `generateUserId` resolves the id. `useCreateProfile` chains them
 * for us: it awaits generateUserId, then calls getAuthToken(resolvedUserId).
 */
export const makeTestGenerateUserId =
  () =>
  async (input?: { displayName?: string; about?: string }): Promise<string> => {
    // Simulate a backend round-trip (account creation / id minting).
    await new Promise((resolve) => setTimeout(resolve, 600));
    const slug =
      (input?.displayName || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 24) || 'user';
    const userId = `test-${slug}`;
    console.log('[generateUserId] input:', input, '-> userId:', userId);
    return userId;
  };
