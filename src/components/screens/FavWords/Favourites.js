import React, {useEffect, useState} from 'react';

import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import FavWordFlatlist from './FavWordFlatlist';

const Profile = () => {
  const [favWords, setFavWords] = useState([]);

  useEffect(() => {
    getWordsFromAsync();
  }, []);

  const getWordsFromAsync = async () => {
    try {
      const favWords_ = await AsyncStorage.getItem('@favWords');
      if (favWords_ !== null) {
        setFavWords(JSON.parse(favWords_));
      }
    } catch (e) {
      console.log('error storeData Async', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* {favWords.map((e, index) => (
        <View key={`key=${index}`}>
          <Text> {e} </Text>
        </View>
      ))} */}
      <FavWordFlatlist />
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
  },
});
