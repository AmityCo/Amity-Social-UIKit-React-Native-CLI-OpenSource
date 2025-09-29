import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import useProfile from './hooks/useProfile';
import Feed from './components/Feed';
import AmityUserProfileHeaderComponent from '~/v4/PublicApi/Components/AmityUserProfileHeaderComponent/AmityUserProfileHeaderComponent';
import { PageID } from '~/v4/enum';
import Header from './components/Header';

type ProfileProps = {
  userId: string;
};

const Profile = ({ userId }: ProfileProps) => {
  const { styles } = useProfile();

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Header pageId={PageID.user_profile_page} userId={userId} />
        <AmityUserProfileHeaderComponent
          pageId={PageID.user_profile_page}
          userId={userId}
        />
        <Feed userId={userId} />
      </View>
    </SafeAreaView>
  );
};

export default Profile;
