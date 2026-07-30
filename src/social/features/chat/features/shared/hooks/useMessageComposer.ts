// useMessageComposer — RN port of AmityUiKitWeb
// v4/chat/features/shared/hooks/useMessageComposer. Owns the composer's entire
// orchestration: text state + canSend, sending text (MessageRepository.createMessage),
// editing (MessageRepository.editMessage), replies, media selection + upload
// (FileRepository.uploadImage/uploadVideo → createMessage with a fileId), optimistic
// "synthetic" pending messages, pending-upload/pending-text retry & discard, and
// mention state. The return object mirrors web's shape 1:1 so the orchestrator +
// AmityMessageComposer consume it unchanged.
//
// RN adaptations vs web (documented in the port report):
//  - `File` (browser) → `Asset` (react-native-image-picker). `handleSelectMedia`
//    takes an Asset; `PendingUpload.file` holds an Asset; `previewUrl` is the
//    asset's local `uri` (no URL.createObjectURL / revokeObjectURL, so the web
//    previewUrls cleanup effect is dropped).
//  - `react-dom` flushSync → plain setState (RN has no react-dom; the extra
//    flush was a web layout concern only).
//  - `useNetworkState().online` (react-use) → @react-native-community/netinfo,
//    same source WaitingForNetwork uses.
//  - `useSDK().currentUserId` → Client.getCurrentUser()?.userId.
//  - `useNotifications('chat').error` → redux toast (useToast → showToast).
//  - `useConfirmContext().info` (title/body/ok dialog) → RN Alert.alert.
//  - `useEditMessageQuery().requestEdit` + `handleTextMessageError` util +
//    `ERROR_CODE` / `COMPOSER_MAX_FILE_SIZE` constants are inlined here so the
//    hook stays self-contained (those web modules have no RN counterpart).
//  - FormData is built with the repo's appendFileToFormData helper (iOS file://
//    strip + the RN { uri, name, type } multipart part).

// 1. React / RN imports
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

// 2. Third-party imports
import {
  FileRepository,
  MessageRepository,
  Client,
} from '@amityco/ts-sdk-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import type { Asset } from 'react-native-image-picker';

// 3. Internal imports
import { resolveString, useString } from '../../../../../../core/localization';
import { useToast } from '../../../../../../core/stores/slices/toastSlice';
import { appendFileToFormData } from '../../../../../../core/utils/fileUpload';
import { ERROR_RESPONSE } from '../../../constants';

// 4. Types
type CreateMessageParams = Parameters<
  typeof MessageRepository.createMessage
>[0];
type CreateMessageResponse = Awaited<
  ReturnType<typeof MessageRepository.createMessage>
>;
type EditMessagePatch = Parameters<typeof MessageRepository.editMessage>[1];
type EditMessageParams = { messageId: string; patch: EditMessagePatch };
type EditMessageResponse = Awaited<
  ReturnType<typeof MessageRepository.editMessage>
>;

// Local mirrors of web `~/v4/helpers/utils` types (no RN counterpart).
export type Mentioned = {
  userId?: string;
  length: number;
  index: number;
  type: string;
  displayName?: string;
};
export type Mentionees = (Amity.UserMention | Amity.ChannelMention)[];

export type FailureReason = 'moderation' | 'generic';

export type PendingUpload = {
  clientId: string;
  dataType: 'image' | 'video';
  /** RN adaptation: web stored a browser `File`; RN stores the picked Asset. */
  file: Asset;
  /** RN adaptation: the asset's local `uri` (web used a created object URL). */
  previewUrl: string;
  status: 'uploading' | 'failed';
  error?: Error;
  fileId?: string;
  createdAt: string;
  failureReason?: FailureReason;
  parentId?: string;
};

export type PendingText = {
  clientId: string;
  text: string;
  parentId?: string;
  metadata?: { mentioned: Mentioned[] };
  mentionees?: Mentionees;
  status: 'failed';
  failureReason?: FailureReason;
  createdAt: string;
};

export type SyntheticPendingMessage = Amity.Message & {
  __syntheticClientId: string;
  __failureReason?: FailureReason;
};

export function isSyntheticPendingMessage(
  message: Amity.Message
): message is SyntheticPendingMessage {
  return (
    typeof (message as Partial<SyntheticPendingMessage>).__syntheticClientId ===
    'string'
  );
}

type UseMessageComposerParams = {
  subChannelId: string;
  enableMention?: boolean;
  editingMessage?: Amity.Message | null;
  onMessageCreated?: () => void;
  onEditCompleted?: () => void;
};

// Inlined web `~/v4/chat/constants` values with no RN counterpart.
const COMPOSER_MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024;
const ERROR_CODE = {
  MESSAGE_TOO_LONG: '400000',
  BLOCKED_WORD: '400308',
  IMAGE_NUDITY: '400314',
  NOT_FOUND: '400400',
};

type Notify = {
  errorToast: (args: { content: string }) => void;
  info: (args: { title: string; content: string; okText?: string }) => void;
};

// Inlined RN equivalent of web `handleTextMessageError`.
// The two strings resolved below — amity_chat_toast_banned_word and
// amity_chat_toast_link_not_allow — carry the V2 Designer copy. RN got there first;
// web has since shipped the identical en + th values in PR 1823, so this is no
// longer a divergence and the LEADS WEB marker that was here has been removed.
function handleTextMessageError(error: unknown, notify: Notify): void {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message.includes(ERROR_CODE.BLOCKED_WORD) ||
    message.includes(ERROR_RESPONSE.CONTAIN_BLOCKED_WORD)
  ) {
    notify.errorToast({
      content: resolveString('amity_chat_toast_banned_word'),
    });
    return;
  }
  if (message.includes(ERROR_RESPONSE.NOT_INCLUDE_WHITELIST_LINK)) {
    notify.errorToast({
      content: resolveString('amity_chat_toast_link_not_allow'),
    });
    return;
  }
  if (message.includes(ERROR_CODE.MESSAGE_TOO_LONG)) {
    notify.info({
      title: resolveString('amity_chat_char_limit_alert_title'),
      content: resolveString('amity_chat_char_limit_alert_message'),
      okText: resolveString('amity_social_button_done'),
    });
    return;
  }
  if (message.includes(ERROR_CODE.NOT_FOUND)) {
    notify.errorToast({
      content: resolveString('amity_chat_toast_reply_parent_deleted'),
    });
  }
}

function createClientId(): string {
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toFormData(asset: Asset): FormData {
  const formData = new FormData();
  appendFileToFormData(
    formData,
    'files',
    asset.uri ?? '',
    asset.fileName ?? 'upload',
    asset.type ?? 'application/octet-stream'
  );
  return formData;
}

function isLinkNotAllowedError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes(ERROR_RESPONSE.NOT_INCLUDE_WHITELIST_LINK)
  );
}

function isModerationError(error: unknown): boolean {
  return (
    error instanceof Error && error.message.includes(ERROR_CODE.IMAGE_NUDITY)
  );
}

function classifyMediaError(error: unknown): FailureReason {
  if (isModerationError(error)) return 'moderation';
  return 'generic';
}

// 5. Hook
export function useMessageComposer({
  subChannelId,
  enableMention = false,
  editingMessage = null,
  onMessageCreated,
  onEditCompleted,
}: UseMessageComposerParams) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const currentUserId = Client.getCurrentUser()?.userId;
  const linkNotAllowedToast = useString('amity_chat_toast_link_not_allow');

  // RN toast/dialog bound to the web Notify shape used by handleTextMessageError.
  // Web routes composer errors through useNotifications('chat') — the custom dark
  // pill — so use variant 'custom' to match (e.g. the invalid-link error toast).
  const errorToast = useCallback(
    ({ content }: { content: string }) =>
      showToast({ message: content, type: 'failed', variant: 'custom' }),
    [showToast]
  );
  const info = useCallback(
    ({
      title,
      content,
      okText,
    }: {
      title: string;
      content: string;
      okText?: string;
    }) => {
      Alert.alert(title, content, [
        { text: okText ?? resolveString('amity_social_button_done') },
      ]);
    },
    []
  );

  // RN network state (web read react-use `online`; null → treat as online).
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected !== false);
    });
    return () => unsubscribe();
  }, []);

  const [text, setText] = useState<string>('');
  const [showMediaSection, setShowMediaSection] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [pendingTexts, setPendingTexts] = useState<PendingText[]>([]);
  const [editorMentions, setEditorMentions] = useState<Mentioned[]>([]);
  const [replyTo, setReplyTo] = useState<Amity.Message | null>(null);
  const cancelledClientIdsRef = useRef<Set<string>>(new Set());
  const retryingClientIdsRef = useRef<Set<string>>(new Set());
  const textRef = useRef<string>('');
  const mentionsRef = useRef<Mentioned[]>([]);
  const wasEditingRef = useRef<boolean>(false);

  const isEditing = editingMessage != null;
  const editingMessageId = editingMessage?.messageId ?? null;
  const originalText = useMemo(() => {
    if (!editingMessage) return '';
    return (
      (editingMessage.data as { text?: string } | undefined)?.text ?? ''
    ).toString();
  }, [editingMessage]);

  const editingMentionsMeta = editingMessage?.metadata as
    | { mentioned?: Mentioned[] }
    | undefined;
  const editingMentions: Mentioned[] = editingMentionsMeta?.mentioned ?? [];

  useEffect(() => {
    if (editingMessage) {
      if (!wasEditingRef.current) {
        textRef.current = text;
        mentionsRef.current = editorMentions;
      }
      setText(originalText);
      setEditorMentions(editingMentionsMeta?.mentioned ?? []);
      setShowMediaSection(false);
      setReplyTo(null);
    }
    wasEditingRef.current = !!editingMessage;
  }, [editingMessage, originalText, editingMentionsMeta]);

  const trimmedText = text.trim();
  const trimmedOriginal = originalText.trim();
  const canSend = isEditing
    ? trimmedText.length > 0 && trimmedText !== trimmedOriginal
    : trimmedText.length > 0;

  const { mutateAsync: createMessageMutation } = useMutation<
    CreateMessageResponse,
    Error,
    CreateMessageParams
  >({
    mutationFn: (params) => MessageRepository.createMessage(params),
  });

  const { mutateAsync: editMessageMutation } = useMutation<
    EditMessageResponse,
    Error,
    EditMessageParams
  >({
    mutationFn: ({ messageId, patch }) =>
      MessageRepository.editMessage(messageId, patch),
  });

  // Inlined RN equivalent of web useEditMessageQuery().requestEdit.
  const requestEdit = useCallback(
    async (
      message: Amity.Message,
      newText: string,
      options?: {
        onSuccess?: () => void;
        metadata?: EditMessagePatch['metadata'];
        mentionees?: EditMessagePatch['mentionees'];
      }
    ) => {
      const messageId = message.messageId;
      if (!messageId) return;
      const trimmed = newText.trim();
      if (trimmed.length === 0) return;

      const patch: EditMessagePatch = {
        data: { text: trimmed },
        metadata: options?.metadata ?? message.metadata,
        mentionees: options?.mentionees ?? message.mentionees,
      };

      await editMessageMutation(
        { messageId, patch },
        {
          onSuccess: () => {
            options?.onSuccess?.();
          },
          onError: (err) => {
            handleTextMessageError(err, { errorToast, info });
          },
        }
      );
    },
    [editMessageMutation, errorToast, info]
  );

  function handleMediaError(err: unknown) {
    if (isLinkNotAllowedError(err)) {
      errorToast({ content: linkNotAllowedToast });
    }
  }

  const toggleMediaSection = useCallback(() => {
    setShowMediaSection((prev) => !prev);
  }, []);

  const collapseMediaSection = useCallback(() => {
    setShowMediaSection(false);
  }, []);

  const handleSendText = useCallback(async () => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;

    const activeMentions = enableMention ? editorMentions : [];
    const mentionees = buildMentionees(activeMentions);
    const metadata =
      activeMentions.length > 0 ? { mentioned: activeMentions } : undefined;

    if (isEditing && editingMessage) {
      if (trimmed === originalText.trim()) return;
      await requestEdit(editingMessage, trimmed, {
        metadata,
        mentionees,
        onSuccess: () => {
          setText('');
          setEditorMentions([]);
          textRef.current = '';
          mentionsRef.current = [];
          onEditCompleted?.();
        },
      });
      return;
    }

    const parentId = replyTo?.messageId;
    setText('');
    setEditorMentions([]);
    setShowMediaSection(false);
    setReplyTo(null);

    if (!isOnline) {
      const pending: PendingText = {
        clientId: createClientId(),
        text: trimmed,
        ...(parentId ? { parentId } : {}),
        ...(metadata ? { metadata } : {}),
        ...(mentionees ? { mentionees } : {}),
        status: 'failed',
        failureReason: 'generic',
        createdAt: new Date().toISOString(),
      };
      setPendingTexts((prev) => [...prev, pending]);
      onMessageCreated?.();
      return;
    }

    try {
      await createMessageMutation(
        {
          subChannelId,
          dataType: 'text',
          data: { text: trimmed },
          metadata,
          mentionees,
          ...(parentId ? { parentId } : {}),
        },
        {
          onSuccess: () => {
            onMessageCreated?.();
          },
          onError: (err) => {
            // PDT-4033: the SDK createMessage optimistically inserts the message
            // into the getMessages collection and keeps it with syncState 'error'
            // on rejection, so the failed bubble is ALREADY shown by the live
            // collection. We must NOT also append our own synthetic PendingText —
            // that produced a DUPLICATE failed bubble. Just surface the toast.
            handleTextMessageError(err, { errorToast, info });
          },
        }
      );
    } catch {
      // mutateAsync rejects in addition to invoking onError above; the failure is
      // already handled there (toast + the failed bubble), so swallow the
      // rejection to avoid an unhandled-promise error.
    }
  }, [
    text,
    enableMention,
    editorMentions,
    replyTo,
    isEditing,
    editingMessage,
    originalText,
    requestEdit,
    onEditCompleted,
    subChannelId,
    isOnline,
    createMessageMutation,
    onMessageCreated,
    errorToast,
    info,
  ]);

  const cancelEdit = useCallback(() => {
    setText(textRef.current);
    setEditorMentions(mentionsRef.current);
    textRef.current = '';
    mentionsRef.current = [];
    onEditCompleted?.();
  }, [onEditCompleted]);

  const startReply = useCallback(
    (message: Amity.Message) => {
      if (isEditing) {
        cancelEdit();
      }
      setReplyTo(message);
    },
    [isEditing, cancelEdit]
  );

  const cancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const runMediaUpload = useCallback(
    async (pending: PendingUpload) => {
      // PDT-4128: an oversize file has to surface as an inline failed bubble in
      // the thread, not a toast. The check lives here rather than in
      // handleSelectMedia so the pending bubble is already in the list and can
      // simply be flipped to 'failed' — same move as web e08c3ed32. fileSize is
      // optional on Asset, so only judge it when the picker reported one.
      if (
        typeof pending.file.fileSize === 'number' &&
        pending.file.fileSize > COMPOSER_MAX_FILE_SIZE
      ) {
        setPendingUploads((prev) =>
          prev.map((p) =>
            p.clientId === pending.clientId
              ? { ...p, status: 'failed', failureReason: 'generic' }
              : p
          )
        );
        return;
      }

      try {
        const formData = toFormData(pending.file);
        const uploaded =
          pending.dataType === 'image'
            ? await FileRepository.uploadImage(formData)
            : await FileRepository.uploadVideo(formData, 'message');

        if (cancelledClientIdsRef.current.has(pending.clientId)) {
          cancelledClientIdsRef.current.delete(pending.clientId);
          return;
        }

        const fileId = uploaded?.data?.[0]?.fileId;
        if (!fileId) throw new Error('Upload did not return a fileId.');

        queryClient.setQueryData(
          ['asc-uikit', 'FileRepository', 'getFile', fileId],
          {
            data: uploaded.data[0],
          }
        );

        setPendingUploads((prev) =>
          prev.map((p) =>
            p.clientId === pending.clientId ? { ...p, fileId } : p
          )
        );

        await createMessageMutation({
          subChannelId,
          dataType: pending.dataType,
          fileId,
          ...(pending.parentId ? { parentId: pending.parentId } : {}),
        });
      } catch (err) {
        if (cancelledClientIdsRef.current.has(pending.clientId)) {
          cancelledClientIdsRef.current.delete(pending.clientId);
          return;
        }
        const failureReason = classifyMediaError(err);
        // Capture the caught value into a normal block const BEFORE the setState
        // updater. Hermes doesn't reliably resolve a `catch` binding referenced
        // inside a nested closure (this updater runs during render), which threw
        // "Property 'err' doesn't exist"; a block const is captured correctly
        // (note failureReason above works for exactly that reason).
        const uploadError = err instanceof Error ? err : new Error(String(err));
        setPendingUploads((prev) =>
          prev.map((p) =>
            p.clientId === pending.clientId
              ? {
                  ...p,
                  status: 'failed',
                  error: uploadError,
                  failureReason,
                }
              : p
          )
        );
        handleMediaError(err);
      }
    },

    [subChannelId, createMessageMutation, queryClient]
  );

  const handleSelectMedia = useCallback(
    async (asset: Asset) => {
      if (!asset || !asset.uri) return;
      const mime = asset.type ?? '';
      const isImage = mime.startsWith('image/');
      const isVideo = mime.startsWith('video/');
      if (!isImage && !isVideo) return;

      const previewUrl = asset.uri;
      const parentId = replyTo?.messageId;
      const pending: PendingUpload = {
        clientId: createClientId(),
        dataType: isImage ? 'image' : 'video',
        file: asset,
        previewUrl,
        status: 'uploading',
        createdAt: new Date().toISOString(),
        ...(parentId ? { parentId } : {}),
      };

      setPendingUploads((prev) => [...prev, pending]);
      setShowMediaSection(false);
      setReplyTo(null);
      onMessageCreated?.();

      await runMediaUpload(pending);
    },
    [runMediaUpload, onMessageCreated, replyTo]
  );

  const handleRetryUpload = useCallback(
    async (clientId: string) => {
      const target = pendingUploads.find((p) => p.clientId === clientId);
      if (!target) return;
      cancelledClientIdsRef.current.delete(clientId);
      setPendingUploads((prev) =>
        prev.map((p) =>
          p.clientId === clientId
            ? { ...p, status: 'uploading', error: undefined }
            : p
        )
      );
      await runMediaUpload({
        ...target,
        status: 'uploading',
        error: undefined,
      });
    },
    [pendingUploads, runMediaUpload]
  );

  const handleRetryText = useCallback(
    async (clientId: string) => {
      const target = pendingTexts.find((p) => p.clientId === clientId);
      if (!target) return;
      if (retryingClientIdsRef.current.has(clientId)) return;
      retryingClientIdsRef.current.add(clientId);
      try {
        await createMessageMutation({
          subChannelId,
          dataType: 'text',
          data: { text: target.text },
          ...(target.metadata ? { metadata: target.metadata } : {}),
          ...(target.mentionees ? { mentionees: target.mentionees } : {}),
          ...(target.parentId ? { parentId: target.parentId } : {}),
        });
        setPendingTexts((prev) => prev.filter((p) => p.clientId !== clientId));
        onMessageCreated?.();
      } catch (err) {
        handleTextMessageError(err, { errorToast, info });
      } finally {
        retryingClientIdsRef.current.delete(clientId);
      }
    },
    [
      pendingTexts,
      subChannelId,
      createMessageMutation,
      onMessageCreated,
      errorToast,
      info,
    ]
  );

  const handleDiscardText = useCallback((clientId: string) => {
    setPendingTexts((prev) => prev.filter((p) => p.clientId !== clientId));
  }, []);

  function handleCancelUpload(clientId: string) {
    cancelledClientIdsRef.current.add(clientId);
    setPendingUploads((prev) =>
      prev.map((p) =>
        p.clientId === clientId
          ? { ...p, status: 'failed', failureReason: 'generic' }
          : p
      )
    );
  }

  const handleDiscardUpload = useCallback((clientId: string) => {
    cancelledClientIdsRef.current.add(clientId);
    setPendingUploads((prev) => prev.filter((p) => p.clientId !== clientId));
  }, []);

  const handleMediaLoaded = useCallback((fileId: string) => {
    setPendingUploads((prev) => prev.filter((p) => p.fileId !== fileId));
  }, []);

  const syntheticMessages = useMemo<SyntheticPendingMessage[]>(() => {
    const media = pendingUploads
      .filter((p) => !p.fileId)
      .map(
        (p) =>
          ({
            __syntheticClientId: p.clientId,
            __failureReason: p.failureReason,
            messageId: '',
            subChannelId,
            creatorId: currentUserId ?? '',
            dataType: p.dataType,
            data: {},
            syncState: (p.status === 'failed'
              ? 'error'
              : 'syncing') as Amity.SyncState,
            createdAt: p.createdAt,
            isDeleted: false,
          } as unknown as SyntheticPendingMessage)
      );

    const texts = pendingTexts.map(
      (p) =>
        ({
          __syntheticClientId: p.clientId,
          __failureReason: p.failureReason,
          messageId: '',
          subChannelId,
          creatorId: currentUserId ?? '',
          dataType: 'text',
          data: { text: p.text },
          metadata: p.metadata,
          parentId: p.parentId,
          syncState: 'error' as Amity.SyncState,
          createdAt: p.createdAt,
          isDeleted: false,
        } as unknown as SyntheticPendingMessage)
    );

    return [...media, ...texts].sort((a, b) => {
      const at = new Date(a.createdAt).getTime();
      const bt = new Date(b.createdAt).getTime();
      return at - bt;
    });
  }, [pendingUploads, pendingTexts, subChannelId, currentUserId]);

  return {
    subChannelId,
    enableMention,
    text,
    setText,
    canSend,
    isEditing,
    editingMessageId,
    originalText,
    editingMentions,
    editorMentions,
    setEditorMentions,
    cancelEdit,
    replyTo,
    startReply,
    cancelReply,
    showMediaSection,
    toggleMediaSection,
    collapseMediaSection,
    pendingUploads,
    syntheticMessages,
    handleSendText,
    handleSelectMedia,
    handleRetryUpload,
    handleCancelUpload,
    handleDiscardUpload,
    handleRetryText,
    handleDiscardText,
    handleMediaLoaded,
  };
}

function buildMentionees(mentions: Mentioned[]): Mentionees | undefined {
  if (mentions.length === 0) return undefined;

  const userIds = Array.from(
    new Set(
      mentions
        .filter(
          (m): m is Mentioned & { userId: string } =>
            m.type === 'user' && !!m.userId
        )
        .map((m) => m.userId)
    )
  );
  const hasChannelMention = mentions.some((m) => m.type === 'channel');

  const out: Mentionees = [];
  if (userIds.length > 0) {
    out.push({ type: 'user', userIds } as Amity.UserMention);
  }
  if (hasChannelMention) {
    out.push({ type: 'channel' } as Amity.ChannelMention);
  }
  return out.length > 0 ? out : undefined;
}
