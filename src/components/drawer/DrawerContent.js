import React, {useState, useContext, useEffect} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  Platform,
  Linking,
} from 'react-native';

import axios from 'axios';
import {wp} from '../../constants/theme';
import {useTheme} from '@react-navigation/native';
import {Switch} from 'react-native-gesture-handler';
import {Drawer, TouchableRipple} from 'react-native-paper';
import IconBack from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';

const DrawerContent = props => {
  const {colors} = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <DrawerContentScrollView {...props}>
        <View>
          <Drawer.Section style={styles.drawerSection}>
            <DrawerItem
              labelStyle={{color: colors.text}}
              icon={({color, size}) => (
                <IconBack icon="arrow-left" color={'black'} size={wp(5)} />
              )}
              label="Буцах"
              onPress={() => {
                props.navigation.closeDrawer();
              }}
            />
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  container: {flex: 1, backgroundColor: 'white'},
});

export default DrawerContent;
