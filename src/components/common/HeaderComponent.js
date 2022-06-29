import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {Header} from 'react-native-elements';

import {useTheme} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import ArrowIcon from 'react-native-vector-icons/AntDesign';
import {ft, wp, hp, COLORS, FONTS} from '../../constants/theme';

// 0: {id: 9, name: 'debitis vitae', image: 'https://i.ibb.co/k90xTLG/Rectangle-18.png', color: '#47bf0c'}
// 1: {id: 12, name: 'sunt culpa', image: 'https://i.ibb.co/k90xTLG/Rectangle-18.png', color: '#aa8f86'}
// 2: {id: 13, name: 'sint animi', image: 'https://i.ibb.co/k90xTLG/Rectangle-18.png', color: '#cb51eb'}
// 3: {id: 14, name: 'temporibus deserunt', image: 'https://i.ibb.co/k90xTLG/Rectangle-18.png', color: '#da2905'}
// 4: {id: 11, name: 'harum deserunt', image: 'https://i.ibb.co/k90xTLG/Rectangle-18.png', color: '#5b4a47'}
// 5: {id: 8, name: 'ab qui', image: 'https://i.ibb.co/k90xTLG/Rectangle-18.png', color: '#26d905'}
// 6: {id: 10, name: 'debitis sit', image: 'https://i.ibb.co/k90xTLG/Rectangle-18.png', color: '#4c305b'}

const HeaderElement = ({
  onPress,
  btnColor,
  btnType = 'light',
  bgColor = 'white',
  title = '',
  style,
  centerContainerStyle,
  ...props
}) => {
  const navigation = useNavigation();
  return (
    <Header
      barStyle={'light-content'}
      backgroundColor={COLORS.brandGray2}
      containerStyle={[styles.header, style]}
      placement="left"
      leftComponent={
        <TouchableOpacity
          style={styles.leftBtn}
          onPress={() => navigation.pop()}>
          <ArrowIcon
            size={ft(23)}
            type={btnType}
            color={'white'}
            name="arrowleft"
          />
        </TouchableOpacity>
      }
      centerComponent={
        <View style={[styles.centerContainer, centerContainerStyle]}>
          <Text numberOfLines={1} style={[styles.title, {color: 'white'}]}>
            {title}
          </Text>
        </View>
      }
      rightComponent={
        <View style={styles.rightBtn}>{props.rightComponent}</View>
      }
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 0,
  },
  title: {
    fontFamily: 'SFProRounded-Heavy',
    fontSize: ft(14),
    textTransform: 'uppercase',
  },
  leftBtn: {
    paddingLeft: wp(2),
    paddingRight: wp(4),
    justifyContent: 'center',
  },
  centerContainer: {
    height: ft(23),
    justifyContent: 'center',
    alignSelf: 'center',
  },
  rightBtn: {
    justifyContent: 'center',
    paddingRight: wp(3),
  },
});

export default HeaderElement;
