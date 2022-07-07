import React, {useEffect, useState, useCallback} from 'react';

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TouchableHighlight,
  FlatList,
  Animated,
} from 'react-native';

import axios from 'axios';
import {SwipeListView} from 'react-native-swipe-list-view';
import Swipeable from 'react-native-swipeable';
import Toast from 'react-native-toast-message';
import {COLORS, FONTS, wp} from '../../../constants/theme';
import ArrowIcon from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Profile = ({navigation}) => {
  const [favWords, setFavWords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    getWordsFromAsync();
  }, [getWordsFromAsync]);

  const getWordsFromAsync = useCallback(async () => {
    try {
      const favWords_ = await AsyncStorage.getItem('@favWords');
      if (favWords_ !== null) {
        let favs = JSON.parse(favWords_);
        let tempData = [];

        favs.map((word, index) => {
          tempData.push({
            key: `${index}`,
            word: word,
          });
        });

        console.log('tempData', tempData);
        setFavWords(tempData);
        setRefreshing(false);
      }
    } catch (e) {
      console.log('error storeData Async', e);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getWordsFromAsync();
  }, [getWordsFromAsync]);

  const oxfordTranslation = async word => {
    setLoading(true);
    axios
      .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then(response => {
        // handle success
        setLoading(false);
        navigation.navigate('Translation', {
          data: response.data[0],
        });
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

  const onRowDidOpen = rowKey => {
    console.log('This row opened', rowKey);
  };

  const onLeftActionStatusChange = rowKey => {
    console.log('onLeftActionStatusChange', rowKey);
  };

  const onRightActionStatusChange = rowKey => {
    console.log('onRightActionStatusChange', rowKey);
  };

  const onRightAction = rowKey => {
    console.log('onRightAction', rowKey);
  };

  const onLeftAction = rowKey => {
    console.log('onLeftAction', rowKey);
  };

  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const deleteRow = (rowMap, rowKey) => {
    closeRow(rowMap, rowKey);
    const newData = [...favWords];
    const prevIndex = favWords.findIndex(item => item.key === rowKey);
    newData.splice(prevIndex, 1);
    setFavWords(newData);
  };

  const VisibleItem = props => {
    const {
      data,
      rowHeightAnimatedValue,
      removeRow,
      leftActionState,
      rightActionState,
    } = props;

    if (rightActionState) {
      Animated.timing(rowHeightAnimatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        removeRow();
      });
    }

    return (
      <Animated.View
        style={[styles.rowFront, {height: rowHeightAnimatedValue}]}>
        <TouchableHighlight
          style={styles.rowFrontVisible}
          onPress={() => oxfordTranslation(data.item.word)}
          underlayColor={'#aaa'}>
          <View>
            <Text
              style={[FONTS.favWord, {textAlign: 'center'}]}
              numberOfLines={1}>
              {data.item.word}
            </Text>
          </View>
        </TouchableHighlight>
      </Animated.View>
    );
  };

  const renderItem = (data, rowMap) => {
    const rowHeightAnimatedValue = new Animated.Value(60);

    return (
      <VisibleItem
        data={data}
        rowHeightAnimatedValue={rowHeightAnimatedValue}
        removeRow={() => deleteRow(rowMap, data.item.key)}
      />
    );
  };

  const HiddenItemWithActions = props => {
    const {
      swipeAnimatedValue,
      leftActionActivated,
      rightActionActivated,
      rowActionAnimatedValue,
      rowHeightAnimatedValue,
      onClose,
      onDelete,
    } = props;

    if (rightActionActivated) {
      Animated.spring(rowActionAnimatedValue, {
        toValue: 500,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.spring(rowActionAnimatedValue, {
        toValue: 75,
        useNativeDriver: false,
      }).start();
    }

    return (
      <Animated.View style={[styles.rowBack, {height: rowHeightAnimatedValue}]}>
        <Text>Left</Text>
        {!leftActionActivated && (
          <TouchableOpacity
            style={[styles.backRightBtn, styles.backRightBtnLeft]}
            onPress={onClose}>
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={25}
              style={styles.trash}
              color="#fff"
            />
          </TouchableOpacity>
        )}
        {!leftActionActivated && (
          <Animated.View
            style={[
              styles.backRightBtn,
              styles.backRightBtnRight,
              {
                flex: 1,
                width: rowActionAnimatedValue,
              },
            ]}>
            <TouchableOpacity
              style={[styles.backRightBtn, styles.backRightBtnRight]}
              onPress={onDelete}>
              <Animated.View
                style={[
                  styles.trash,
                  {
                    transform: [
                      {
                        scale: swipeAnimatedValue.interpolate({
                          inputRange: [-90, -45],
                          outputRange: [1, 0],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}>
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={25}
                  color="#fff"
                />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  const renderHiddenItem = (data, rowMap) => {
    const rowActionAnimatedValue = new Animated.Value(75);
    const rowHeightAnimatedValue = new Animated.Value(60);

    return (
      <HiddenItemWithActions
        data={data}
        rowMap={rowMap}
        rowActionAnimatedValue={rowActionAnimatedValue}
        rowHeightAnimatedValue={rowHeightAnimatedValue}
        onClose={() => closeRow(rowMap, data.item.key)}
        onDelete={() => deleteRow(rowMap, data.item.key)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <FlatList
          scrollEnabled={false}
          keyExtractor={(item, index) => `key1${index}`}
          data={favWords}
          renderItem={({item, index}) => (
            <View style={styles.wordContainer}>
              <View key={`item_id=${index}`}>
                <Text style={[FONTS.DetectedText, {color: COLORS.brandGray2}]}>
                  {item}
                </Text>
              </View>
              <View>
                <ArrowIcon
                  name="right"
                  size={wp(6)}
                  color={COLORS.brandGray2}
                />
              </View>
            </View>
          )}
        />
      </ScrollView> */}
      <SwipeListView
        data={favWords}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        leftOpenValue={75}
        rightOpenValue={-150}
        disableRightSwipe
        leftActivationValue={100}
        rightActivationValue={-200}
        leftActionValue={0}
        rightActionValue={-500}
        onRowDidOpen={onRowDidOpen}
        onLeftAction={onLeftAction}
        onRightAction={onRightAction}
        onLeftActionStatusChange={onLeftActionStatusChange}
        onRightActionStatusChange={onRightActionStatusChange}
      />
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  wordContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 15,
    marginVertical: 5,
    width: wp(90),
    height: wp(15),
  },
  backTextWhite: {
    color: '#FFF',
  },
  rowFront: {
    backgroundColor: 'yellow',
    borderRadius: 5,
    height: 60,
    margin: 5,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 5,
  },
  rowFrontVisible: {
    height: 60,
    borderRadius: 5,
    paddingLeft: 15,
    marginBottom: 15,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    margin: 5,
    marginBottom: 15,
    borderRadius: 5,
  },
  backRightBtn: {
    alignItems: 'flex-end',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    paddingRight: 17,
  },
  backRightBtnLeft: {
    backgroundColor: '#1f65ff',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  trash: {
    height: 25,
    width: 25,
    marginRight: 7,
  },
  title: {
    fontFamily: 'SFProRounded-Regular',
    fontSize: 14,
    color: COLORS.brandGray2,
  },
  details: {
    fontSize: 12,
    color: '#999',
  },
});
