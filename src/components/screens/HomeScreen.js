import React, {useState} from 'react';

import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import Toast from 'react-native-toast-message';
import IconCam from 'react-native-vector-icons/Ionicons';
import Search from 'react-native-vector-icons/EvilIcons';

import {hp, wp, FONTS, COLORS, ft} from '../../constants/theme';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Translation from '../common/Translation';

const HomeScreen = ({navigation}) => {
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const [antonyms_, setAntonyms] = useState(false);
  const [synonyms_, setSynonyms] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [oxfordDef, setOxfordDef] = useState(null);

  const axios = require('axios');

  const oxfordTranslation = async word => {
    setLoading(true);
    axios
      .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then(response => {
        // handle success
        setOxfordDef(response.data[0]);
        setLoading(false);
        console.log('first', oxfordDef);
      })
      .catch(function (error) {
        // handle error
        setLoading(false);
        console.log('err --->', error);
        Toast.show({
          type: 'error',
          text1: 'Орчуулга олдсонгүй 😢',
        });
      });
  };

  const searchBtn = async val => {
    if (val) {
      oxfordTranslation(val);
    }
    let arr = [];
    try {
      const favWords = await AsyncStorage.getItem('@favWords');
      if (favWords !== null) {
        arr = JSON.parse(favWords);
        arr.includes(val.toLowerCase()) ? setSaved(true) : setSaved(false);
      }
    } catch (e) {
      console.log('error async getData', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{flexDirection: 'row', alignSelf: 'center'}}>
        <View style={styles.searchContainer}>
          <TouchableOpacity
            onPress={() => searchBtn(search)}
            style={{
              marginLeft: wp(3),
              paddingVertical: hp(1.5),
            }}>
            <Search
              name={'search'}
              size={25}
              style={{
                color: 'gray',
              }}
            />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.searchInputStyle,
              {
                color: 'black',
              },
            ]}
            returnKeyLabel={'search'}
            returnKeyType={'search'}
            onEndEditing={() => searchBtn(search)}
            onSubmitEditing={() => searchBtn(search)}
            placeholder="Search for words"
            placeholderTextColor="rgba(172, 180, 195, 1)"
            onChangeText={e => {
              setSearch(e);
            }}
          />
          <View
            style={[
              styles.cameraIcon,
              {
                justifyContent: 'center',
                paddingHorizontal: 15,
                paddingVertical: 5,
              },
            ]}>
            <TouchableOpacity
              onPress={async () => {
                navigation.navigate('WordSelector');
                // this.English2English();
              }}>
              <IconCam
                name="ios-camera"
                size={wp(8)}
                color={COLORS.brandGray2}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {oxfordDef && (
        <>
          {isLoading ? (
            <ActivityIndicator
              style={{justifyContent: 'center', alignItems: 'center', flex: 1}}
              size="large"
              color={'#219bd9'}
            />
          ) : (
            <Translation data={oxfordDef} saved={saved} setSaved={setSaved} />
          )}
        </>
      )}

      <Toast ref={ref => Toast.setRef(ref)} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    flex: 1,
  },
  searchInputStyle: {
    paddingLeft: wp(3),
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    fontSize: ft(10),
    flex: 1,
    width: '100%',
    height: '100%',
    fontFamily: 'SFProRounded-Semibold',
  },
  searchContainer: {
    flexDirection: 'row',
    width: wp(90),
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(243, 245, 249, 1)',
    borderRadius: 15,
  },
  wordInfoContainer: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  definitionContainer: {
    backgroundColor: '#F6F6F5',
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
  },
  utilyIcons: {
    flexDirection: 'row',
    position: 'absolute',
    top: 5,
    right: 30,
    zIndex: 5,
  },
});
