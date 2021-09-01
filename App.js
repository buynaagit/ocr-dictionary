//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import WordSelector from './src/components/wordSelector/index';

const Stack = createStackNavigator();
// create a component
const MyComponent = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="wordSelector">
        <Stack.Screen name="wordSelector" component={WordSelector} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// define your styles

//make this component available to the app
export default MyComponent;
