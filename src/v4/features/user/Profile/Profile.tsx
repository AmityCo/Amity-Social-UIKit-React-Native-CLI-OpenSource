import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import Header from './components/Header';
import Info from './components/Info';
import useProfile from './hooks/useProfile';

type ProfileProps = {
  userId: string;
};

const Profile = ({ userId }: ProfileProps) => {
  const { styles } = useProfile();

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Header userId={userId} />
        <Info userId={userId} />
      </View>
    </SafeAreaView>
  );
};

export default Profile;
