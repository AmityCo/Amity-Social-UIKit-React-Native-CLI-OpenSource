/**
 * fileUpload.ts
 *
 * New-Architecture-compatible helper for attaching local files to a FormData.
 *
 * Background
 * ----------
 * In React Native ≤ 0.82 (Old Architecture) you could pass a plain object
 * `{ uri, name, type }` to `FormData.append()` and the bridge would convert it
 * into a proper multipart file part automatically.
 *
 * React Native 0.73+ New Architecture (Bridgeless / JSI) removed that implicit
 * conversion.  Passing the plain object now results in one of:
 *   • `TypeError: formData.get is not a function`  (axios ≥ 1 checks for this)
 *   • The upload body being sent without file bytes
 *
 * Fix: use the standard `fetch()` API to open the local URI and read it into a
 * real `Blob`, then append that Blob.  This works on both Old and New
 * Architecture, and handles `file://` (iOS & Android) and `content://`
 * (Android) URIs.
 */

/**
 * Append a local file to `formData` in a New-Architecture-safe way.
 *
 * @param formData   The FormData instance to mutate.
 * @param fieldName  The multipart field name (e.g. `'files'`).
 * @param fileUri    Local file URI (`file://…` or `content://…`).
 *                   If the scheme is absent it is assumed to be a bare iOS
 *                   path and `file://` is prepended automatically.
 * @param fileName   The filename sent in the Content-Disposition header.
 * @param mimeType   MIME type for the part (e.g. `'image/jpeg'`).
 *                   Used as a fallback when the Blob has no type or reports
 *                   `application/octet-stream`.
 */
export async function appendFileToFormData(
  formData: FormData,
  fieldName: string,
  fileUri: string,
  fileName: string,
  mimeType: string
): Promise<void> {
  // Normalise the URI so fetch() can handle it on both platforms.
  // iOS image-picker returns bare paths after stripping "file://" in old code;
  // re-attach the scheme here so fetch() knows to read a local file.
  const normalizedUri =
    fileUri.startsWith('file://') || fileUri.startsWith('content://')
      ? fileUri
      : `file://${fileUri}`;

  const response = await fetch(normalizedUri);
  const blob = await response.blob();

  // RN's fetch() sometimes returns 'application/octet-stream' for local files
  // even when the file is an image/video.  Override with the caller-supplied
  // MIME type so the server receives the correct Content-Type for the part.
  //
  // Type notes:
  //  • RN's BlobOptions requires `lastModified` — we supply Date.now().
  //  • RN's FormData.append is typed for the legacy `{ uri, name, type }` object
  //    and doesn't accept Blob as a second argument; we cast to `any` here.
  //    At runtime, RN's networking layer handles Blob values correctly.
  const typedBlob =
    blob.type && blob.type !== 'application/octet-stream'
      ? blob
      : new Blob([blob], { type: mimeType, lastModified: Date.now() });

  (formData as any).append(fieldName, typedBlob, fileName);
}
