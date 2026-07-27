// ⚠️ TEST ONLY — REMOVE BEFORE SHIPPING. ⚠️
//
// Shared secure-mode test helpers used by SignedInScreen and VisitorScreen to
// exercise the `getAuthToken` (and `enrollProfile`) flow end-to-end.
//
// A real integration would call YOUR backend to mint the auth token so the
// Server Key never lives in the app. Here we call the social.plus auth-token
// endpoint directly with a hardcoded Server Key purely to test the flow.
// Response is text/plain (the raw token, wrapped in double quotes).

const TEST_SERVER_KEY =
  '';

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
 * Mock `enrollProfile` that mimics the real `POST /community/enrollment`
 * contract: it takes the entered `displayName`, waits like a server-to-server
 * round-trip (backend creates the Amity user + session), and returns the
 * `communityId` the UIKit signs in as. Deterministic here (derived from the
 * displayName) so re-saving hits the same account; a real backend returns a
 * generated UUID.
 *
 * This mirrors the real contract: the userId (communityId) does NOT exist until
 * Save, which is exactly why `getAuthToken` must be a callback — the token can
 * only be minted after `enrollProfile` resolves the id. `useCreateProfile`
 * chains them: it awaits enrollProfile, then calls getAuthToken(communityId).
 * On a real backend error (banned / already-enrolled / retryable) this would
 * throw, and the UIKit shows a failure toast.
 */
export const makeTestEnrollProfile =
  () =>
  async (input?: { displayName?: string }): Promise<string> => {
    // Simulate the backend enrollment round-trip (user + session creation).
    // The backend owns fields like deviceId (any id, e.g. a random UUID); the
    // client does not send them.
    await new Promise((resolve) => setTimeout(resolve, 600));
    const slug =
      (input?.displayName || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 24) || 'user';
    const communityId = `test-${slug}`;
    console.log('[enrollProfile] input:', input, '-> communityId:', communityId);
    return communityId;
  };
