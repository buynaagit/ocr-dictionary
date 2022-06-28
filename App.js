//import liraries
import React, {Component} from 'react';
import {Button, View} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {createDrawerNavigator} from '@react-navigation/drawer';

import Profile from './src/components/screens/Profile';
import WordSelector from './src/components/wordSelector/index';
import DrawerContent from './src/components/drawer/DrawerContent';
import HomeScreen from './src/components/screens/HomeScreen';
import BottomTabNavigator from './src/navigators/BottomTabNavigator';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// create a component
const MyComponent = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={'Home'}>
        <Stack.Screen name="Home" component={BottomTabNavigator} />
        <Stack.Screen name="WordSelector" component={WordSelector} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// define your styles

//make this component available to the app
export default MyComponent;
