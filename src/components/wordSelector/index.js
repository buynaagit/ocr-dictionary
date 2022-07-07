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
import {ft, hp, wp} from '../../constants/theme';

import {check, PERMISSIONS, openSettings} from 'react-native-permissions';

import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/Ionicons';
import Copy from 'react-native-vector-icons/AntDesign';
import Save from 'react-native-vector-icons/AntDesign';
import HeaderComponent from '../common/HeaderComponent';
import Camera, {Constants} from '../../components/camera';
import Clipboard from '@react-native-clipboard/clipboard';
import SoundIcon from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SelectableText} from '@alentoma/react-native-selectable-text';

let whichLang = 'mn';
let oxfordDef = null;
let translatedWord = null;
let displayLang = 'Англи хэл';

const langImg = {
  mn: require('../../../assets/mongolia.png'),
  fr: require('../../../assets/france.png'),
  ru: require('../../../assets/russia.png'),
  it: require('../../../assets/italy.png'),
  sv: require('../../../assets/sweden.png'),
  de: require('../../../assets/germany.png'),
  ko: require('../../../assets/south-korea.png'),
  cs: require('../../../assets/czech-republic.png'),
  en: require('../../../assets/united-states.png'),
  tr: require('../../../assets/turkey.png'),
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
    saved: false,
    userWord: '',
    errorMsg: '',
    copiedText: '',
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
    setLoadingMp3: false,
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

  copyToClipboard = word => {
    Clipboard.setString(word);
    Toast.show({
      type: 'success',
      text1: 'Copied',
    });
  };

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

  storeWord = async value => {
    try {
      await AsyncStorage.setItem('@storage_Key', value);
    } catch (e) {
      // saving error
    }
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
      console.log('translatedWord', translatedWord);
      this.setState({
        modalShown: true,
        translateLoad: false,
      });
    } else {
      if (whichLang == 'en') {
        this.oxfordTranslation(words);
      } else {
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

  oxfordTranslation = async word => {
    let arr = [];
    try {
      const favWords = await AsyncStorage.getItem('@favWords');
      if (favWords !== null) {
        arr = JSON.parse(favWords);
        arr.includes(word.toLowerCase())
          ? this.setState({saved: true})
          : this.setState({saved: false});
      }
    } catch (e) {
      console.log('error async getData', e);
    }
    axios
      .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then(response => {
        // handle success
        oxfordDef = response.data[0];
        console.log('first', oxfordDef);
        this.setState({
          modalShown: true,
          translateLoad: false,
        });
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

  playPronunciation(data) {
    let audioSource;
    data.forEach((e, index) => {
      if (e.audio != '') {
        audioSource = e.audio;
      }
    });
    this.playWord(audioSource);
  }

  playWord = speakMp3 => {
    this.setState({
      setLoadingMp3: true,
    });

    console.log('Playing ', speakMp3);
    // Enable playback in silence mode
    Sound.setCategory('Playback');

    // See notes below about preloading sounds within initialization code below.
    var player = new Sound(speakMp3, null, error => {
      if (error) {
        console.log('failed to load the sound', error);
        this.setState({setLoadingMp3: false});
        return;
      }

      player.setVolume(1);

      // Play the sound with an onEnd callback
      player.play(success => {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
        this.setState({setLoadingMp3: false});

        player.release();
      });
    });
  };

  storeData = async value => {
    console.log('value', value);
    let arr = [];

    try {
      const favWords = await AsyncStorage.getItem('@favWords');
      if (favWords !== null) {
        arr = JSON.parse(favWords);
        console.log('getDatafromAsync', arr);
      }
    } catch (e) {
      console.log('error storeData Async', e);
    }

    if (arr.includes(value) && arr.length > 0) {
      Toast.show({
        type: 'error',
        text1: 'You have already saved the word',
      });
    } else {
      try {
        arr.push(value);
        const jsonValue = JSON.stringify(arr);
        console.log('jsonValue', jsonValue);
        this.setState({saved: true});
        await AsyncStorage.setItem('@favWords', jsonValue);
      } catch (e) {
        // saving error
      }
    }
  };

  render() {
    return (
      <>
        <View style={[styles.container, this.props.style]}>
          <HeaderComponent
            title={'Text Recognition'}
            rightComponent={
              <TouchableOpacity
                onPress={() => {
                  this.setState({langModal: true});
                }}>
                <View style={{flexDirection: 'row'}}>
                  <View
                    style={{alignItems: 'center', justifyContent: 'center'}}>
                    <Image
                      source={langImg[whichLang]}
                      style={styles.flagIconSelected}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            }
          />

          {/* {'Текстийг дурын хэмжээгээр сонгож орчуулах комманд өгнө'} */}
          <View>
            <ScrollView>
              <View
                style={{
                  padding: 10,
                  marginBottom: hp(18),
                }}>
                <SelectableText
                  style={FONTS.DetectedText}
                  menuItems={['орчуулах']}
                  onSelection={({
                    content,
                    eventType,
                    selectionStart,
                    selectionEnd,
                  }) => {
                    this.translateFunction(content);
                  }}
                  value={this.populateWords()}
                  // value={
                  //   'On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.'
                  // }
                />
              </View>
            </ScrollView>
          </View>
        </View>

        {/* {`Camera icon`} */}
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.cameraIcon}
            onPress={async () => {
              this.checkPermission(PERMISSION_TYPE.camera);
            }}>
            <Icon name="ios-camera" size={wp(10)} color={'white'} />
          </TouchableOpacity>
        </View>

        {
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

        {/* {'Translation Modal, and Select language Modal'} */}
        <View>
          <Modal
            style={{alignItems: 'center', justifyContent: 'flex-end', top: 20}}
            isVisible={this.state.modalShown}
            onBackdropPress={() => {
              this.setState({modalShown: false});
            }}>
            <>
              {oxfordDef !== null ? (
                <View style={styles.modalStyleOxford}>
                  {this.translateLoad ? (
                    <ActivityIndicator
                      style={{justifyContent: 'center', alignItems: 'center'}}
                      size="small"
                      color={'#219bd9'}
                    />
                  ) : (
                    <View>
                      <View style={{zIndex: 5}}>
                        <View style={styles.wordInfoContainer}>
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({modalShown: false});
                            }}
                            style={styles.modalCloseBtn}
                          />
                          <View
                            style={{
                              alignSelf: 'center',
                            }}>
                            <Text
                              style={[
                                FONTS.modalHeaderText,
                                {
                                  color: 'white',
                                  textAlign: 'center',
                                  fontSize: ft(30),
                                },
                              ]}>
                              {oxfordDef.word}
                            </Text>
                            <>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignSelf: 'center',
                                }}>
                                {oxfordDef.meanings.map((e, index) => (
                                  <View style={{marginRight: 5}}>
                                    <Text style={styles.partOfSpeech}>
                                      {e.partOfSpeech}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            </>
                            <View style={{marginTop: 10}}>
                              <Text style={styles.phonetic}>
                                {oxfordDef.phonetic}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-evenly',
                            }}>
                            {oxfordDef.phonetics.length > 0 && (
                              <TouchableOpacity
                                disabled={this.state.setLoadingMp3}
                                onPress={() => {
                                  this.playPronunciation(oxfordDef.phonetics);
                                }}
                                style={styles.buttons}>
                                <SoundIcon
                                  name="sound"
                                  size={wp(8)}
                                  color={
                                    this.state.setLoadingMp3 ? 'black' : 'white'
                                  }
                                />
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              onPress={() => this.storeData(oxfordDef.word)}
                              style={styles.buttons}>
                              {this.state.saved ? (
                                <Save
                                  name="star"
                                  size={wp(8)}
                                  color={'yellow'}
                                />
                              ) : (
                                <Save
                                  name="staro"
                                  size={wp(8)}
                                  color={'white'}
                                />
                              )}
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                this.copyToClipboard(oxfordDef.word);
                              }}
                              style={styles.buttons}>
                              <Copy name="copy1" size={wp(8)} color={'white'} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <ScrollView style={styles.definitionContainer}>
                          <View>
                            <View
                              style={{
                                flexDirection: 'row',
                                marginBottom: hp(2),
                              }}>
                              <Text
                                style={[
                                  FONTS.SelectedLanguageText,
                                  {
                                    textAlign: 'left',
                                    paddingRight: 10,
                                    fontSize: ft(12),
                                    color: COLORS.warningText,
                                  },
                                ]}>
                                synonyms
                              </Text>
                              <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}>
                                {oxfordDef.meanings.map((e, index) => (
                                  <>
                                    {e.synonyms.map((element, index_) => (
                                      <>
                                        {e.synonyms.length > 0 ? (
                                          <View
                                            key={`=-${index}`}
                                            style={{
                                              flexDirection: 'row',
                                            }}>
                                            <View
                                              style={{
                                                justifyContent: 'center',
                                                paddingRight: 8,
                                              }}>
                                              <Text
                                                style={{
                                                  fontFamily:
                                                    'SFProRounded-Regular',
                                                  color: COLORS.genderText,
                                                }}>
                                                {element}
                                              </Text>
                                            </View>
                                          </View>
                                        ) : (
                                          <View>
                                            <Text
                                              style={[
                                                FONTS.SelectedLanguageText,
                                                {
                                                  textAlign: 'left',
                                                  paddingRight: 10,
                                                  fontSize: ft(12),
                                                  color: COLORS.warningText,
                                                },
                                              ]}>
                                              No synonym found
                                            </Text>
                                          </View>
                                        )}
                                      </>
                                    ))}
                                  </>
                                ))}
                              </ScrollView>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                marginBottom: hp(2),
                              }}>
                              <Text
                                style={[
                                  FONTS.SelectedLanguageText,
                                  {
                                    textAlign: 'left',
                                    paddingRight: 10,
                                    fontSize: ft(12),
                                    color: COLORS.antonym,
                                  },
                                ]}>
                                antonyms
                              </Text>
                              <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}>
                                {oxfordDef.meanings.map((e, index) => (
                                  <>
                                    {e.antonyms.map((element, index) => (
                                      <>
                                        <View
                                          key={`=-${index}`}
                                          style={{
                                            flexDirection: 'row',
                                          }}>
                                          <View
                                            style={{
                                              justifyContent: 'center',
                                              paddingRight: 8,
                                            }}>
                                            <Text
                                              style={{
                                                fontFamily:
                                                  'SFProRounded-Regular',
                                                color: COLORS.genderText,
                                              }}>
                                              {element}
                                            </Text>
                                          </View>
                                        </View>
                                      </>
                                    ))}
                                  </>
                                ))}
                              </ScrollView>
                            </View>
                            <View>
                              <Text
                                style={[
                                  FONTS.DetectedText,
                                  {textAlign: 'center'},
                                ]}>
                                Definition
                              </Text>
                              {oxfordDef.meanings.map((e, index) => (
                                <View
                                  key={`=-${index}`}
                                  style={{
                                    marginTop: 10,
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: ft(14),
                                      fontFamily: 'SFProRounded-Semibold',
                                    }}>
                                    {e.partOfSpeech}
                                  </Text>
                                  <>
                                    {e.definitions
                                      .slice(0, 3)
                                      .map((element, index_) => (
                                        <View
                                          style={{
                                            flexDirection: 'row',
                                            marginTop: 10,
                                          }}>
                                          <View
                                            style={{
                                              justifyContent: 'center',
                                              paddingRight: 10,
                                            }}>
                                            <Text
                                              style={{
                                                fontFamily:
                                                  'SFProRounded-Semibold',
                                                color: COLORS.brandGray,
                                              }}>
                                              {index_ + 1}
                                            </Text>
                                          </View>
                                          <Text
                                            style={{
                                              fontFamily:
                                                'SFProRounded-Regular',
                                              fontSize: ft(13),
                                            }}>
                                            {element.definition}
                                          </Text>
                                        </View>
                                      ))}
                                  </>
                                </View>
                              ))}
                            </View>
                          </View>
                        </ScrollView>
                      </View>
                      <View style={styles.layerWhite} />
                      <View style={styles.backLayerGray} />
                    </View>
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
                      <ScrollView style={{paddingTop: hp(2.5)}}>
                        <Text
                          style={
                            (FONTS.modalHeaderText,
                            {
                              alignSelf: 'center',
                              paddingBottom: hp(10),
                            })
                          }>
                          <Text
                            style={{
                              color: COLORS.brandGray,
                              fontFamily: 'SFProRounded-Bold',
                              fontSize: ft(14),
                              textAlign: 'center',
                            }}>
                             ОРЧУУЛГА {`\n\n`}
                          </Text>
                          <Text
                            style={{
                              fontFamily: 'SFProRounded-Regular',
                              fontSize: ft(12),
                            }}>
                            {translatedWord}
                          </Text>
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
  container: {backgroundColor: 'white', height: '100%'},
  buttons: {
    width: wp(16),
    height: wp(16),
    backgroundColor: COLORS.brandGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  backLayerGray: {
    backgroundColor: '#293241',
    width: wp(30),
    height: wp(30),
    position: 'absolute',
    top: hp(20),
    right: 0,
  },
  modalStyleOxford: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    width: wp(100),
    height: hp(90),
  },
  partOfSpeech: {
    fontFamily: 'SFProRounded-Regular',
    fontSize: ft(14),
    color: 'white',
    textAlign: 'center',
  },
  wordInfoContainer: {
    backgroundColor: COLORS.brandGray2,
    borderBottomLeftRadius: 40,
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    width: wp(100),
    height: hp(30),
    justifyContent: 'space-evenly',
  },
  definitionContainer: {
    height: hp(70),
    width: wp(100),
    backgroundColor: 'white',
    borderTopRightRadius: 40,
    paddingHorizontal: wp(7),
    paddingTop: wp(10),
  },
  word: {
    ...FONTS.text5,
  },
  okButton: {
    fontSize: 30,
  },
  btnContainer: {position: 'absolute', bottom: 20, alignSelf: 'center'},
  cameraIcon: {
    borderRadius: 8,
    backgroundColor: '#023047',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  modalStyle: {
    paddingHorizontal: wp(10),
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: 'white',
    width: wp(100),
    height: hp(65),
  },

  langModalStyle: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: 'white',
    width: wp(100),
    height: hp(28),
  },
  layerWhite: {
    backgroundColor: 'white',
    width: wp(30),
    height: wp(30),
    position: 'absolute',
    zIndex: 0,
    top: hp(20),
    left: 0,
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
  phonetic: {
    fontFamily: 'SFProRounded-Regular',
    fontSize: ft(18),
    fontStyle: 'italic',
    color: 'white',
    textAlign: 'center',
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

  myToast: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.lightBlue,
    borderRadius: 15,
    marginTop: hp(15),
  },
  modalCloseBtn: {
    height: wp(2),
    width: wp(35),
    borderRadius: 20,
    alignSelf: 'center',
    backgroundColor: 'white',
  },
});
