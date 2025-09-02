import { CategoryRepository } from '@amityco/ts-sdk-react-native';
import { useLiveCollection } from './useLiveCollection';

type UseCategoryCollection = {
  params?: Parameters<typeof CategoryRepository.getCategories>[0];
};

export const useCategoryCollection = ({
  params,
}: UseCategoryCollection = {}) => {
  const query = useLiveCollection({
    key: ['category-collections'],
    params,
    fetcher: CategoryRepository.getCategories,
  });

  return {
    ...query,
    categories: query.data,
  };
};
