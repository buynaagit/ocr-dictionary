/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Api from '../../lib/api';
import Helper from '../../lib/helper';
import WordDefinition from '../../components/wordDef';
import Header from '../../components/header';
import commonStyles from '../../../commonStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/Ionicons';
import {images, icons, COLORS, SIZES, FONTS} from '../../constants';
import translate from 'translate-google-api';

// 20200502 JustCode: Import the camera module
import Camera, {Constants} from '../../components/camera';
import WordSelector from '../../components/wordSelector';
import {color} from 'react-native-reanimated';

class Search extends React.Component {
  constructor(props) {
    super(props);
    // 20200502 JustCode:
    // Add in showCamera, showWordList and recogonizedText state
    this.state = {
      userWord: '',
      errorMsg: '',
      loading: false,
      definition: null,
      showCamera: false,
      showWordList: false,
      recogonizedText: null,
    };
  }

  async onSearch() {
    if (this.state.userWord.length <= 0) {
      this.setState({errorMsg: 'Хайх хэсэгт үгээ оруулна уу.'});
      return;
    }
    const result = await translate(this.state.userWord, {
      tld: 'cn',
      to: 'mn',
    });
    if (this.state.userWord) {
      console.log(`result`, result);
      this.setState({
        loading: false,
        errorMsg: result,
      });
    }
  }

  onUserWordChange(text) {
    this.setState({userWord: text});
  }

  // this.state.userWord
  // 20200502 JustCode:
  // Receive the recogonizedText from the Camera module
  onOCRCapture(recogonizedText) {
    console.log('onCapture', recogonizedText);
    this.setState({
      showCamera: false,
      showWordList: Helper.isNotNullAndUndefined(recogonizedText),
      recogonizedText: recogonizedText,
    });
  }

  // 20200502 JustCode:
  // Receive the word selected by the user via WordSelector component
  onWordSelected(word) {
    this.setState({showWordList: false, userWord: word});
    if (word.length > 0) {
      setTimeout(() => {
        this.onSearch();
      }, 500);
    }
  }

  render() {
    return (
      <>
        <SafeAreaView style={commonStyles.content}>
          <Header
            navigation={this.props.navigation}
            Title={'Hippocards dictionary'}
            isAtRoot={true}
          />
          <ScrollView contentInsetAdjustmentBehavior="automatic">
            <View style={[commonStyles.column, commonStyles.header]}>
              <View style={{paddingBottom: 10}}>
                <Image
                  style={commonStyles.logo}
                  source={require('../../../assets/hippologooo.png')}
                />
              </View>
              <Text
                style={{
                  color: COLORS.brand,
                  ...FONTS.text3,
                }}>
                TEXT DETECTION
              </Text>
            </View>

            {/* 
               20200430 - JustCode:
                 Add camera button to allow user to use camera to capture word. Both the 
                 TextInput & TouchableOpacity will be wrapped with a new View.
             */}
            <View style={styles.searchBox}>
              <TouchableOpacity
                style={styles.searchCamera}
                onPress={() => {
                  this.setState({showCamera: true});
                }}>
                <Icon name="ios-camera" size={25} color={COLORS.brand} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.searchCamera}
                onPress={() => this.onSearch()}>
                <Icon2 name="search" size={25} color={COLORS.brand} />
              </TouchableOpacity>
              <TextInput
                style={styles.searchInput}
                onChangeText={text => this.onUserWordChange(text)}
                placeholder={'Key in the word to search'}
                placeholderTextColor="gray"
                value={this.state.userWord}
              />
            </View>

            <View style={{minHeight: 10, maxHeight: 10}}></View>

            <View
              style={{
                borderRadius: 10,
                width: 100,
                alignSelf: 'center',
                backgroundColor: COLORS.brand,
                marginVertical: 10,
              }}>
              <Button
                title="Хайх"
                color="white"
                onPress={() => this.onSearch()}
              />
            </View>
            {this.state.errorMsg.length > 0 && (
              <View style={{marginHorizontal: 20}}>
                <Text style={commonStyles.errMsg}>{this.state.errorMsg}</Text>
              </View>
            )}

            {/* Display word definition as custom component */}
            <WordDefinition def={this.state.definition} />
          </ScrollView>
        </SafeAreaView>
        {
          // 20200502 - JustCode:
          // Display the camera to capture text
          this.state.showCamera && (
            <Camera
              cameraType={Constants.Type.back}
              flashMode={Constants.FlashMode.off}
              autoFocus={Constants.AutoFocus.on}
              whiteBalance={Constants.WhiteBalance.auto}
              ratio={'4:3'}
              quality={0.5}
              imageWidth={800}
              enabledOCR={true}
              onCapture={(data, recogonizedText) =>
                this.onOCRCapture(recogonizedText)
              }
              onClose={_ => {
                this.setState({showCamera: false});
              }}
            />
          )
        }
        {
          // 20200502 - JustCode:
          // Display the word list capture by the camera and allow user to select
          this.state.showWordList && (
            <WordSelector
              wordBlock={this.state.recogonizedText}
              onWordSelected={word => this.onWordSelected(word)}
            />
          )
        }
        {this.state.loading && (
          <ActivityIndicator
            style={commonStyles.loading}
            size="large"
            color={'#219bd9'}
          />
        )}
      </>
    );
  }
}

export default props => {
  const navigation = useNavigation();
  return <Search {...props} navigation={navigation} />;
};

const styles = StyleSheet.create({
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderColor: 'gray',
    backgroundColor: '#E3E1E1',
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 18,
    marginHorizontal: 20,
  },
  searchInput: {
    padding: 10,
    flex: 1,
  },
  // 20200502 - JustCode:
  // Camera icon style
  searchCamera: {
    maxWidth: 50,
    marginLeft: 5,
    padding: 0,
    alignSelf: 'center',
  },
});
