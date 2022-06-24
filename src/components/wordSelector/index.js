import React, {Component} from 'react';

import {
  Alert,
  View,
  Text,
  Image,
  Platform,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import Helper from '../../lib/helper';
import Modal from 'react-native-modal';
import translate from 'translate-google-api';
import {COLORS, FONTS} from '../../constants';
import Toast from 'react-native-toast-message';
import commonStyles from '../../../commonStyles';
import {ft, hp, wp} from '../../constants/theme';

import {
  check,
  PERMISSIONS,
  RESULTS,
  request,
  openSettings,
} from 'react-native-permissions';

import Icon from 'react-native-vector-icons/Ionicons';
import Camera, {Constants} from '../../components/camera';
import ArrowDown from 'react-native-vector-icons/SimpleLineIcons';
import {SelectableText} from '@alentoma/react-native-selectable-text';

let whichLang = 'mn';
let oxfordDef = null;
let translatedWord = null;
let displayLang = 'MОНГОЛ ХЭЛ';

const langImg = {
  it: require('../../../assets/italy.png'),
  fr: require('../../../assets/france.png'),
  ru: require('../../../assets/russia.png'),
  sw: require('../../../assets/sweden.png'),
  tr: require('../../../assets/turkey.png'),
  de: require('../../../assets/germany.png'),
  mn: require('../../../assets/mongolia.png'),
  ko: require('../../../assets/south-korea.png'),
  en: require('../../../assets/united-states.png'),
  cz: require('../../../assets/czech-republic.png'),
};

const axios = require('axios');

const PLATFORM_CAMERA_PERMISSIONS = {
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
};

const REQUEST_PERMISSION_TYPE = {
  camera: PLATFORM_CAMERA_PERMISSIONS,
};

const PERMISSION_TYPE = {
  camera: 'camera',
};

export default class WordSelector extends Component {
  state = {
    userWord: '',
    errorMsg: '',
    mySentence: [],
    wordList: null,
    loading: false,
    endingIdx: null,
    definition: null,
    langModal: false,
    permStatus: null,
    showCamera: false,
    modalShown: false,
    startingIdx: null,
    selectedWord: null,
    selectedWordIdx: -1,
    showWordList: false,
    translateload: false,
    recogonizedText: null,
    oxfordDefinition: null,
  };

  componentDidMount() {
    // this.setState({showCamera: true});
    // Break down all the words detected by the camera
  }

  //Checking permission when clicking on camera button. If blocked jump to Phone settings
  checkPermission = async (type): Promise<boolean> => {
    const permissions = REQUEST_PERMISSION_TYPE[type][Platform.OS];
    if (!permissions) {
      return true;
    }
    try {
      const result = await check(permissions);
      if (result === 'denied') {
        await this.setState({showCamera: true});
      } else if (result === 'blocked') {
        openSettings();
      } else {
        this.setState({showCamera: true});
      }
    } catch (error) {
      return false;
    }
  };

  showAlert = () =>
    Alert.alert('Камерын зөвшөөрөл өгөх', '', [
      {
        text: 'ОК',
        onPress: () => openSettings(),
        // style: 'cancel',
      },
    ]);

  //Text recognition by camera ( Detect хийсэн текстийг нэг нэгээр нь array-д хийж wordList хувьсагчид хадгална )
  onOCRCapture(recogonizedText) {
    let wordList = [];
    if (
      recogonizedText &&
      recogonizedText.textBlocks &&
      recogonizedText.textBlocks.length > 0
    ) {
      for (let idx = 0; idx < recogonizedText.textBlocks.length; idx++) {
        let text = recogonizedText.textBlocks[idx].value;
        if (text && text.trim().length > 0) {
          let words = text.split(/[\s,?]+/);
          if (words && words.length > 0) {
            for (let idx2 = 0; idx2 < words.length; idx2++) {
              if (words[idx2].length > 0) wordList.push(words[idx2]);
            }
          }
        }
      }
      this.setState({wordList: wordList});
    }
    this.setState({
      showCamera: false,
      showWordList: Helper.isNotNullAndUndefined(recogonizedText),
      recogonizedText: recogonizedText,
    });
  }

  customToast = {
    myToast: ({props}) => (
      <View style={[styles.myToast, props.style]}>
        <Text
          style={[
            FONTS.TranslatedWord,
            {
              color: 'white',
              fontSize: ft(25),
            },
          ]}>
          {translatedWord != null ? translatedWord : 'oрчуулж байна.'}
        </Text>
      </View>
    ),
  };

  //Үг олон байвал modal нэг байвал toast аар орчуулна.
  async translateFunction(words) {
    this.setState({
      translateload: true,
    });
    console.log('whichLang :>> ', whichLang);
    if (words.indexOf(' ') >= 0) {
      const result = await translate(words, {
        to: whichLang,
      });
      translatedWord = result;
      this.setState({
        modalShown: true,
        translateLoad: false,
      });
    } else {
      if (whichLang == 'en') {
        this.oxfordTranslation(words);
      } else {
        console.log('whichland, word :>> ', whichLang, words);
        const result = await translate(words, {
          to: whichLang,
        });
        translatedWord = result;
        Toast.show({
          type: 'myToast',
        });
      }
    }
  }

  oxfordTranslation = async words => {
    this.setState({
      modalShown: true,
    });
    axios
      .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${words}`)
      .then(function (response) {
        // handle success
        oxfordDef = response.data[0];
        console.log('oxfordDef :>> ', oxfordDef);
      })
      .catch(function (error) {
        // handle error
        console.log('err --->', error);
        Toast.show({
          type: 'error',
          text1: 'Орчуулга олдсонгүй 😢',
        });
      });
  };
  //Changing the recognized text array into string with a space.
  populateWords = () => {
    let myText = [];
    if (this.state.wordList && this.state.wordList.length > 0) {
      myText = this.state.wordList;
      myText = myText.join('-');
      myText = myText.replace(/-/g, ' ');
    }
    return myText;
  };

  render() {
    return (
      <>
        <SafeAreaView style={[styles.container, this.props.style]}>
          <View
            style={{
              alignSelf: 'center',
            }}>
            <TouchableOpacity
              onPress={() => {
                this.setState({langModal: true});
              }}>
              <View style={{flexDirection: 'row'}}>
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                  <Image
                    source={langImg[whichLang]}
                    style={styles.flagIconSelected}
                  />
                </View>
                <View>
                  <Text style={FONTS.chooselangText}>{displayLang}</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={FONTS.chooseLangText2}>ХЭЛ СОЛИХ </Text>
                    <View>
                      <Image
                        style={{width: wp(3.3), height: wp(3.3)}}
                        source={require('../../../assets/downArrow.png')}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* <View
            style={{
              flexDirection: 'row',
              alignSelf: 'center',
              alignItems: 'center',
            }}>
            <Image
              source={langImg[whichLang]}
              style={styles.flagIconSelected}
            />
            <Image
              style={{width: wp(3.3), height: wp(3.3)}}
              source={require('../../../assets/downArrow.png')}
            />
          </View> */}

          <View>
            <ScrollView>
              <View
                style={{
                  padding: 10,
                  marginBottom: hp(10),
                }}>
                <SelectableText
                  style={FONTS.DetectedText}
                  menuItems={['орчуулах']}
                  onSelection={({
                    eventType,
                    content,
                    selectionStart,
                    selectionEnd,
                  }) => {
                    this.translateFunction(content);
                  }}
                  // value={this.populateWords()}
                  value={
                    'On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.'
                  }
                />
              </View>
            </ScrollView>
          </View>
          <View style={styles.btnContainer}>
            <View
              style={[
                styles.btnstyle,
                {justifyContent: 'center', paddingHorizontal: wp(2)},
              ]}>
              <TouchableOpacity
                onPress={async () => {
                  // this.checkPermission(PERMISSION_TYPE.camera);
                  this.English2English();
                }}>
                <Icon name="ios-camera" size={wp(10)} color={'white'} />
              </TouchableOpacity>
            </View>
          </View>
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

        {this.state.loading && (
          <ActivityIndicator
            style={commonStyles.loading}
            size="large"
            color={'#219bd9'}
          />
        )}
        <View>
          <Modal
            // animationIn={'zoomIn'}
            // animationOut={'zoomOut'}
            style={{alignItems: 'center', justifyContent: 'flex-end', top: 20}}
            isVisible={this.state.modalShown}
            onBackdropPress={() => {
              this.setState({modalShown: false});
            }}>
            <>
              {oxfordDef ? (
                <View style={styles.modalStyle}>
                  {this.translateLoad ? (
                    <ActivityIndicator
                      style={{justifyContent: 'center', alignItems: 'center'}}
                      size="small"
                      color={'#219bd9'}
                    />
                  ) : (
                    <ScrollView style={{marginTop: hp(6.5)}}>
                      <Text
                        style={
                          (FONTS.modalHeaderText,
                          {alignSelf: 'center', textAlign: 'center'})
                        }>
                        <Text
                          style={{
                            color: COLORS.brandGray,
                            fontFamily: 'SFProRounded-Bold',
                            fontSize: ft(14),
                          }}>
                           ОРЧУУЛГА {`\n\n`}
                        </Text>
                        {oxfordDef.word}
                      </Text>
                    </ScrollView>
                  )}
                </View>
              ) : (
                <View>
                  <View style={styles.modalStyle}>
                    {this.translateLoad ? (
                      <ActivityIndicator
                        style={{justifyContent: 'center', alignItems: 'center'}}
                        size="small"
                        color={'#219bd9'}
                      />
                    ) : (
                      <ScrollView style={{marginTop: hp(6.5)}}>
                        <Text
                          style={
                            (FONTS.modalHeaderText,
                            {alignSelf: 'center', textAlign: 'center'})
                          }>
                          <Text
                            style={{
                              color: COLORS.brandGray,
                              fontFamily: 'SFProRounded-Bold',
                              fontSize: ft(14),
                            }}>
                             ОРЧУУЛГА {`\n\n`}
                          </Text>
                          {translatedWord}
                        </Text>
                      </ScrollView>
                    )}
                  </View>
                </View>
              )}
            </>
          </Modal>
          <Modal
            style={{
              alignSelf: 'center',
              justifyContent: 'flex-start',
              bottom: 20,
            }}
            isVisible={this.state.langModal}
            onBackdropPress={() => {
              this.setState({langModal: false});
            }}>
            <View style={styles.langModalStyle}>
              <SafeAreaView>
                <View style={{alignSelf: 'center'}}>
                  <Text style={FONTS.SelectLanguageText}>
                    ОРЧУУЛАХ ХЭЛ СОНГОХ
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignSelf: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      whichLang = 'mn';
                      displayLang = 'MОНГОЛ ХЭЛ';
                      this.setState({langModal: false});
                    }}
                    style={whichLang == 'mn' && styles.flagIcon}>
                    <Image
                      source={require('../../../assets/mongolia.png')}
                      style={styles.flagImg}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      whichLang = 'fr';
                      displayLang = 'ФРАНЦ ХЭЛ';
                      this.setState({langModal: false});
                    }}
                    style={whichLang == 'fr' && styles.flagIcon}>
                    <Image
                      source={require('../../../assets/france.png')}
                      style={styles.flagImg}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      whichLang = 'ru';
                      displayLang = 'ОРОС ХЭЛ';
                      this.setState({langModal: false});
                    }}
                    style={whichLang == 'ru' && styles.flagIcon}>
                    <Image
                      source={require('../../../assets/russia.png')}
                      style={styles.flagImg}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      whichLang = 'it';
                      displayLang = 'ИТАЛИ ХЭЛ';
                      this.setState({langModal: false});
                    }}
                    style={whichLang == 'it' && styles.flagIcon}>
                    <Image
                      source={require('../../../assets/italy.png')}
                      style={styles.flagImg}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      whichLang = 'sv';
                      displayLang = 'ШВЕД ХЭЛ';
                      this.setState({langModal: false});
                    }}
                    style={whichLang == 'sv' && styles.flagIcon}>
                    <Image
                      source={require('../../../assets/sweden.png')}
                      style={styles.flagImg}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                  <TouchableOpacity
                    onPress={() => {
                      whichLang = 'de';
                      displayLang = 'ГЕРMАН ХЭЛ';
                      this.setState({langModal: false});
                    }}
                    style={whichLang == 'de' && styles.flagIcon}>
                    <Image
                      source={require('../../../assets/germany.png')}
                      style={styles.flagImg}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      whichLang = 'ko';
                      displayLang = 'СОЛОНГОС ХЭЛ';
                      this.setState({langModal: false});
                    }}
                    style={whichLang == 'ko' && styles.flagIcon}>
                    <Image
                      source={require('../../../assets/south-korea.png')}
                      style={styles.flagImg}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      whichLang = 'cs';
                      displayLang = 'ЧЕХ ХЭЛ';
                      this.setState({langModal: false});
                    }}
                    style={whichLang == 'cs' && styles.flagIcon}>
                    <Image
                      source={require('../../../assets/czech-republic.png')}
                      style={styles.flagImg}
                    />
                  </TouchableOpacity>

                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        whichLang = 'en';
                        displayLang = 'АНГЛИ ХЭЛ';
                        this.setState({langModal: false});
                      }}
                      style={whichLang == 'en' && styles.flagIcon}>
                      <Image
                        source={require('../../../assets/united-states.png')}
                        style={styles.flagImg}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      whichLang = 'tr';
                      displayLang = 'ТУРК ХЭЛ';
                      this.setState({langModal: false});
                    }}
                    style={whichLang == 'tr' && styles.flagIcon}>
                    <Image
                      source={require('../../../assets/turkey.png')}
                      style={styles.flagImg}
                    />
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </View>
          </Modal>
        </View>

        <Toast ref={ref => Toast.setRef(ref)} config={this.customToast} />
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  header: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: COLORS.brand,
  },
  headerText: {
    ...FONTS.text3,
    textAlign: 'center',
    color: 'white',
  },
  wordList: {
    paddingBottom: hp(20),
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
  },
  selectedWord: {
    flex: 0,
    borderColor: COLORS.brand,
    backgroundColor: COLORS.brand,
    padding: 4,
  },
  nonSelectedWord: {
    flex: 0,
    borderWidth: 0,
    padding: 4,
  },
  word: {
    ...FONTS.text5,
  },
  okButton: {
    fontSize: 30,
  },
  btnContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignSelf: 'center',
    zIndex: 1,
  },
  modalStyle: {
    paddingHorizontal: wp(10),
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: 'white',
    width: wp(100),
    height: hp(50),
  },
  langModalStyle: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: 'white',
    width: wp(100),
    height: hp(28),
  },

  flagIcon: {
    borderWidth: 1,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.brand,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  flagIconSelected: {
    width: wp(9),
    height: wp(9),
    marginHorizontal: wp(1),
  },
  flagImg: {
    width: wp(16),
    height: wp(16),
    marginHorizontal: wp(1),
  },
  btnstyle: {
    borderRadius: 8,
    backgroundColor: '#023047',
  },
  myToast: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.lightBlue,
    borderRadius: 15,
    marginTop: hp(15),
  },
});
