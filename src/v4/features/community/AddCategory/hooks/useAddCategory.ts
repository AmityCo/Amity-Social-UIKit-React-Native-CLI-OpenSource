import { useStyles } from '../styles';
import { useCategoryCollection } from '~/v4/hook/collections/useCategoryCollection';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '~/v4/routes/RouteParamList';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

function useAddCategory() {
  const { styles, theme } = useStyles();
  const schema = z.object({
    categories: z.array(z.custom<Amity.Category>()).min(1),
  });
  const query = useCategoryCollection({
    params: {
      limit: 20,
    },
  });
  const route =
    useRoute<RouteProp<RootStackParamList, 'CommunityAddCategory'>>();
  const {
    formState: { isDirty, isSubmitting, isValid },
    handleSubmit,
    control,
    watch,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { categories: route.params?.categories ?? [] },
  });

  const onSubmit = () => {
    route.params?.onAddedAction
      ? route.params.onAddedAction(watch('categories'))
      : null;
  };

  return {
    ...query,
    categories: query.data,
    styles,
    theme,
    isDirty,
    isSubmitting,
    isValid,
    handleSubmit,
    control,
    onSubmit,
  };
}

export default useAddCategory;
