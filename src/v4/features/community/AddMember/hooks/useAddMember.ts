import { useStyles } from '../styles';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useUserCollection } from '~/v4/hook/collections/useUserCollection';
import { useSearchUserByDisplayNameCollection } from '~/v4/hook/collections/useSearchUserByDisplayNameCollection';
import { useCommunityMemberCollection } from '~/v4/hook/collections/useCommunityMemberCollection';

type UseAddMemberProps = {
  communityId?: string;
};

function useAddMember({ communityId }: UseAddMemberProps = {}) {
  const { styles, theme } = useStyles();
  const route = useRoute<RouteProp<RootStackParamList, 'CommunityAddMember'>>();

  const schema = z.object({
    users: z.array(z.custom<Amity.User>()).min(1),
    search: z.string().optional(),
  });

  const {
    watch,
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, isValid },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      search: '',
      users: route.params?.users ?? [],
    },
  });

  const values = watch();

  const userCollection = useUserCollection({
    enabled: !communityId,
    params: {
      limit: 20,
    },
  });

  const searchUserDisplayNameCollection = useSearchUserByDisplayNameCollection({
    params: {
      displayName: values.search,
      limit: 20,
    },
    enabled: !!values.search && !communityId,
  });

  const communityMemberCollection = useCommunityMemberCollection({
    params: {
      limit: 20,
      communityId,
    },
    enabled: !!communityId,
  });

  const onSubmit = () => {
    route.params?.onAddedAction
      ? route.params.onAddedAction(watch('users'))
      : null;
  };

  const communityMemberIds = communityMemberCollection.data.map(
    (member) => member.userId
  );
  const nonMemberCollection = {
    ...userCollection,
    data: userCollection.data.filter(
      (user) => !communityMemberIds.includes(user.userId)
    ),
  };

  const nonMemberSearchUserByDisplayNameCollection = {
    ...searchUserDisplayNameCollection,
    data: searchUserDisplayNameCollection.data.filter(
      (user) => !communityMemberIds.includes(user.userId)
    ),
  };

  const collection = communityId
    ? values.search?.length > 0
      ? nonMemberSearchUserByDisplayNameCollection
      : nonMemberCollection
    : values.search?.length > 0
    ? searchUserDisplayNameCollection
    : userCollection;

  return {
    styles,
    theme,
    isDirty,
    isSubmitting,
    isValid,
    handleSubmit,
    control,
    collection,
    onSubmit,
    values,
  };
}

export default useAddMember;
