import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { PostTargetType } from '../../enums';

interface UIState {
  showPostTypeChoiceModal: boolean;
  userId: string | null;
  targetId?: string | null;
  targetType?: PostTargetType | '';
  targetName?: string;
  isPublic?: boolean;
  postSetting?: ValueOf<
    Readonly<{
      ONLY_ADMIN_CAN_POST: 'ONLY_ADMIN_CAN_POST';
      ADMIN_REVIEW_POST_REQUIRED: 'ADMIN_REVIEW_POST_REQUIRED';
      ANYONE_CAN_POST: 'ANYONE_CAN_POST';
    }>
  >;
  needApprovalOnPostCreation?: boolean;
  showToastMessage?: boolean;
  toastMessage?: string;
  isLoadingToast?: boolean;
  isSuccessToast?: boolean;
  /** Bumped once per feed reload. Feed items are keyed by post id, so a reload
   * reuses their component instances and any position they were holding
   * survives it; anything that must start over on a reload watches this. */
  feedReloadToken: number;
}
const initialState: UIState = {
  showPostTypeChoiceModal: false,
  userId: null,
  targetId: null,
  targetType: '',
  targetName: '',
  postSetting: null,
  needApprovalOnPostCreation: true,
  isPublic: false,
  feedReloadToken: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openPostTypeChoiceModal: (
      state,
      action: PayloadAction<{
        userId: string;
        targetId?: string;
        targetName?: string;
        targetType?: PostTargetType;
        isPublic?: boolean;
        postSetting?: ValueOf<
          Readonly<{
            ONLY_ADMIN_CAN_POST: 'ONLY_ADMIN_CAN_POST';
            ADMIN_REVIEW_POST_REQUIRED: 'ADMIN_REVIEW_POST_REQUIRED';
            ANYONE_CAN_POST: 'ANYONE_CAN_POST';
          }>
        >;
        needApprovalOnPostCreation?: boolean;
      }>
    ) => {
      state.showPostTypeChoiceModal = true;
      state.userId = action.payload.userId;
      state.targetId = action.payload.targetId || null;
      state.targetName = action.payload.targetName || '';
      state.targetType = action.payload.targetType || '';
      state.postSetting = action.payload.postSetting || null;
      state.isPublic = action.payload.isPublic;
      state.needApprovalOnPostCreation =
        action.payload.needApprovalOnPostCreation;
    },
    closePostTypeChoiceModal: (state) => {
      state.showPostTypeChoiceModal = false;
      state.userId = null;
      state.targetId = null;
      state.targetType = '';
      state.targetName = '';
      state.postSetting = null;
      state.needApprovalOnPostCreation = true;
      state.isPublic = false;
    },
    showToastMessage: (
      state,
      action: PayloadAction<{
        toastMessage: string;
        isLoadingToast?: boolean;
        isSuccessToast?: boolean;
      }>
    ) => {
      state.showToastMessage = true;
      state.toastMessage = action.payload.toastMessage;
      state.isLoadingToast = action.payload.isLoadingToast;
      state.isSuccessToast = action.payload.isSuccessToast;
    },
    markFeedReloaded: (state) => {
      state.feedReloadToken += 1;
    },
    hideToastMessage: (state) => {
      state.showToastMessage = false;
      state.toastMessage = '';
      state.isLoadingToast = false;
      state.isSuccessToast = false;
    },
  },
});

export default uiSlice;
