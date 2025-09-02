import { RootStackParamList } from '~/v4/routes/RouteParamList';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { useToast } from '~/v4/stores/slices/toast';
import useImagePicker from '~/v4/hook/useImagePicker';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AmityCommunityPrivacyEnum } from '../../shared/types';
import { useStyles } from '../styles';
import { useMutation } from '@tanstack/react-query';
import useFile from '~/v4/hook/files/useFile';

const schema = z.object({
  image: z.custom<Amity.File<'image'>>().optional(),
  displayName: z.string().trim().min(1).max(30),
  description: z.string().trim().max(180).optional(),
  categories: z.array(z.custom<Amity.Category>()),
  privacy: z.enum(AmityCommunityPrivacyEnum),
});

type EditCommunityFormValues = z.infer<typeof schema>;

type EditCommunityPayload = Parameters<
  typeof CommunityRepository.updateCommunity
>[1];

type EditCommunityResponse = Awaited<
  ReturnType<typeof CommunityRepository.updateCommunity>
>;

export const useEditCommunity = (community: Amity.Community) => {
  const { showToast } = useToast();
  const { styles, theme } = useStyles();
  const image = useFile<'image'>(community.avatarFileId);

  const {
    watch,
    formState: { isDirty, isSubmitting, isValid },
    handleSubmit,
    setValue,
    control,
  } = useForm<EditCommunityFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    values: {
      image,
      displayName: community.displayName || '',
      description: community.description || '',
      categories: community.categories,
      privacy: community.isPublic
        ? AmityCommunityPrivacyEnum.PUBLIC
        : AmityCommunityPrivacyEnum.PRIVATE,
    },
  });

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'CreateCommunity'>
    >();

  const { openImageGallery, progress, openCamera } = useImagePicker();

  const values = watch();

  const { mutateAsync } = useMutation<
    EditCommunityResponse,
    Error,
    EditCommunityPayload
  >({
    mutationFn: (payload) =>
      CommunityRepository.updateCommunity(community.communityId, payload),
    onSuccess: () => {
      navigation.navigate('CommunityProfilePage', {
        communityId: community.communityId,
      });
      showToast({
        type: 'success',
        message: 'Successfully updated community profile.',
      });
    },
    onError: () => {
      showToast({
        type: 'failed',
        message: 'Failed to save your community profile. Please try again.',
      });
    },
  });

  const onSubmit = async () => {
    const isPublic = values.privacy === AmityCommunityPrivacyEnum.PUBLIC;

    await mutateAsync({
      isPublic,
      isDiscoverable: isPublic,
      requiresJoinApproval: false,
      description: values.description,
      displayName: values.displayName,
      avatarFileId: values.image?.fileId,
      categoryIds: values.categories.map((category) => category.categoryId),
    });
  };

  return {
    isDirty,
    isSubmitting,
    isValid,
    handleSubmit,
    setValue,
    control,
    onSubmit,
    openImageGallery,
    progress,
    openCamera,
    styles,
    theme,
    navigation,
    values,
  };
};
