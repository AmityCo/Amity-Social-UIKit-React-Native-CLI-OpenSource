import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AmityCommunityAddCategoryPage from '../../legacy/Pages/AmityCommunityAddCategoryPage';
import { RootStackParamList } from '../../../core/routes/RouteParamList';

type CommunityAddCategoryProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityAddCategory'
>;

function CommunityAddCategory(_: CommunityAddCategoryProps) {
  return <AmityCommunityAddCategoryPage />;
}

export default CommunityAddCategory;
