import React from 'react';

import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

const Header = ({navigation, LeftButton, RightButton, Title}) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftButton}>
        {LeftButton ? (
          <LeftButton />
        ) : (
          <TouchableOpacity
            style={{marginLeft: 10}}
            onPress={() => {
              navigation.pop();
            }}>
            <Icon name={'ios-arrow-back'} size={30} color={'gray'} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.title}>
        {Title && typeof Title === 'string' ? (
          <Text style={styles.titleText}>{Title}</Text>
        ) : (
          <Title />
        )}
      </View>
      <View style={styles.rightButton}>{RightButton && <RightButton />}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
  },
  leftButton: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  rightButton: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default Header;
