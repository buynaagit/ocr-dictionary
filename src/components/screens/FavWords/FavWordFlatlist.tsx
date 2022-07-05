import React, {useState, useEffect} from 'react';
import {Animated, FlatList} from 'react-native';

import {Cards} from './Card';
import FavWordCard from './FavWordCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const cards = [
  {
    type: Cards.Card1,
  },
  {
    type: Cards.Card2,
  },
  {
    type: Cards.Card3,
  },
  {
    type: Cards.Card4,
  },
  {
    type: Cards.Card5,
  },
  {
    type: Cards.Card6,
  },
];

const FavWordFlatlist = () => {
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

  const y = new Animated.Value(0);
  const onScroll = Animated.event([{nativeEvent: {contentOffset: {y}}}], {
    useNativeDriver: true,
  });
  return (
    <AnimatedFlatList
      scrollEventThrottle={16}
      bounces={false}
      data={cards}
      renderItem={({index, item: {type}}) => (
        <FavWordCard {...{index, y, type}} />
      )}
      keyExtractor={item => item.index}
      {...{onScroll}}
    />
  );
};

export default FavWordFlatlist;
