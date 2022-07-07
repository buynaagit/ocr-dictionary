//import liraries
import React, {Component} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import WordSelector from './src/components/wordSelector/index';
import Translation from './src/components/common/Translation';
import BottomTabNavigator from './src/navigators/BottomTabNavigator';

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
        <Stack.Screen name="Translation" component={Translation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// define your styles

//make this component available to the app
export default MyComponent;
