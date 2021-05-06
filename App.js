//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from './src/HomeScreen';
import TextDetection from './src/screens/search/index';

const Stack = createStackNavigator();
// create a component
const MyComponent = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="textDetection">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="textDetection" component={TextDetection} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// define your styles

//make this component available to the app
export default MyComponent;
