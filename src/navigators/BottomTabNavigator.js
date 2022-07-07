import React from 'react';

import {StyleSheet, Text} from 'react-native';

import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';

import {useTheme} from '@react-navigation/native';
import Search from 'react-native-vector-icons/Foundation';
import Saved from 'react-native-vector-icons/AntDesign';
import HomeScreen from '../components/screens/HomeScreen';
import Favourites from '../components/screens/FavWords';
import {wp, COLORS, ft} from '../constants/theme';

const Tab = createMaterialBottomTabNavigator();

const BottomTabNavigator = route => {
  const {colors} = useTheme();

  return (
    <Tab.Navigator
      shifting={false}
      initialRouteName="HomeTab"
      activeColor={COLORS.lightBlue}
      barStyle={{backgroundColor: COLORS.brandGray2}}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={({}) => ({
          tabBarLabel: <Text style={styles.label}>Dictionary</Text>,
          tabBarIcon: ({color}) => (
            <Search name="book-bookmark" color={color} size={wp(6.5)} />
          ),
        })}
      />

      <Tab.Screen
        name="Favourites"
        component={Favourites}
        options={({}) => ({
          tabBarLabel: <Text style={styles.label}>Favourites</Text>,
          tabBarIcon: ({color}) => (
            <Saved name="hearto" color={color} size={wp(6.4)} />
          ),
        })}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  label: {
    fontFamily: 'SFProRounded-Regular',
    textAlign: 'center',
    fontSize: ft(11),
  },
});

export default BottomTabNavigator;
