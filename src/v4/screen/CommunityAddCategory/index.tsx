import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunityAddCategoryPage from '~/v4/PublicApi/Pages/AmityCommunityAddCategoryPage';
import { RootStackParamList } from '~/v4/routes/RouteParamList';

type CommunityAddCategoryProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityAddCategory'
>;

function CommunityAddCategory(_: CommunityAddCategoryProps) {
  return <AmityCommunityAddCategoryPage />;
}

export default CommunityAddCategory;
