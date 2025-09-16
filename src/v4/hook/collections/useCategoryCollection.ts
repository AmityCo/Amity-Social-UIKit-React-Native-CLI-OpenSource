import { CategoryRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from './useLiveCollection';
import { QUERY_KEY } from '~/v4/constants';

type UseCategoryCollection = {
  params?: Parameters<typeof CategoryRepository.getCategories>[0];
};

export const useCategoryCollection = ({
  params,
}: UseCategoryCollection = {}) => {
  const query = useLiveCollection({
    key: [QUERY_KEY.CATEGORY_COLLECTION],
    params,
    fetcher: CategoryRepository.getCategories,
  });

  return {
    ...query,
    categories: query.data,
  };
};
