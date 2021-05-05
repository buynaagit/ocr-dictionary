//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
// import ProductScanRNCamera from './textDetection';

// create a component
const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text>HomeScreeneeeeeeeee</Text>
      <Button title="camera" />
      {/* <ProductScanRNCamera /> */}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

//make this component available to the app
export default HomeScreen;
