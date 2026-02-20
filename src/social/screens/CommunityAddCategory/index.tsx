import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../core/routes/RouteParamList';
import AddCategory from '../../features/community/AddCategory';

type CommunityAddCategoryProps = NativeStackScreenProps<
  RootStackParamList,
  'CommunityAddCategory'
>;

function CommunityAddCategory(_: CommunityAddCategoryProps) {
  return <AddCategory />;
}

export default CommunityAddCategory;
