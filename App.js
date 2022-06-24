//import liraries
import React, {Component} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {createDrawerNavigator} from '@react-navigation/drawer';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';

import WordSelector from './src/components/wordSelector/index';
import Profile from './src/components/screens/Profile';
import {COLORS} from './src/constants';

const Drawer = createDrawerNavigator();

const Stack = createStackNavigator();
// create a component
const MyComponent = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={'WordSelector'}>
        <Drawer.Screen name="WordSelector" component={WordSelector} />
        <Drawer.Screen name="Profile" component={Profile} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

// define your styles

//make this component available to the app
export default MyComponent;
