/**
 * fileUpload.ts
 *
 * Helper for attaching a local file to a FormData for upload to the Amity SDK.
 *
 * Why the `{ uri, name, type }` object (and NOT a Blob)
 * -----------------------------------------------------
 * React Native's `FormData.getParts()` only turns a value into a multipart
 * *file* part when that value is an object carrying a `uri`:
 *
 *   • `name` → the `filename` in the `Content-Disposition` header
 *   • `type` → the part's `Content-Type`
 *   • `uri`  → the local path the native networking layer streams bytes from
 *
 * This is the canonical React Native upload pattern and works on BOTH the Old
 * and the New (Bridgeless / JSI) Architecture — RN 0.83 did not change this JS
 * API. The Amity SDK's `uploadImage` is built around it too: it calls
 * `formData.getAll('files')` and reads `files[0].name` to set
 * `preferredFilename`.
 *
 * Do NOT append a Blob here. A Blob produced by `fetch(uri).blob()` has:
 *   • no `uri`            → RN attaches no file body, so the request carries no
 *                           bytes and the server responds `400 "No files
 *                           uploaded."`
 *   • no top-level `name` → `files[0].name` is `null`, so `preferredFilename`
 *                           is sent as `null`.
 * That combination is exactly the failure seen in PDT-3461.
 */

import { Platform } from 'react-native';

/**
 * Append a local file to `formData` as a React-Native multipart file part.
 *
 * @param formData   The FormData instance to mutate.
 * @param fieldName  The multipart field name (e.g. `'files'`).
 * @param fileUri    Local file URI (`file://…` or `content://…`).
 * @param fileName   The filename sent in the Content-Disposition header.
 * @param mimeType   MIME type for the part (e.g. `'image/jpeg'`).
 */
export function appendFileToFormData(
  formData: FormData,
  fieldName: string,
  fileUri: string,
  fileName: string,
  mimeType: string
): void {
  // Android keeps the URI as-is (`content://` / `file://` are both streamable);
  // iOS expects the `file://` scheme stripped to a bare path.
  const uri =
    Platform.OS === 'android' ? fileUri : fileUri.replace('file://', '');

  // RN's FormData.append is typed for the legacy `{ uri, name, type }` object
  // but its TS types don't expose that overload, so we cast to `any`.
  formData.append(fieldName, {
    uri,
    name: fileName,
    type: mimeType,
  } as any);
}
