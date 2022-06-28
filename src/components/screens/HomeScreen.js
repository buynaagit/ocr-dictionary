import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import Search from 'react-native-vector-icons/EvilIcons';
import {hp, wp, FONTS, COLORS, ft} from '../../constants/theme';

const HomeScreen = ({navigation}) => {
  const [search, setSearch] = useState('');

  const searchBtn = val => {
    console.log('val', val);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{flexDirection: 'row', alignSelf: 'center'}}>
        <View style={styles.searchContainer}>
          <TouchableOpacity
            onPress={() => searchBtn()}
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
              FONTS.DetectedText,
              styles.searchInputStyle,
              {
                color: COLORS.genderText,
              },
            ]}
            onEndEditing={() => searchBtn()}
            placeholder="Search for words"
            placeholderTextColor="rgba(172, 180, 195, 1)"
            onChangeText={e => {
              setSearch(e);
              searchBtn(e);
            }}
          />
        </View>
      </View>
      <Button
        title="text recognition"
        onPress={() => {
          navigation.navigate('WordSelector');
        }}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
  },
  searchInputStyle: {
    paddingLeft: wp(3),
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    fontSize: ft(10),
    flex: 1,
    width: '100%',
    height: '100%',
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
    // marginRight: wp(5),
  },
});
