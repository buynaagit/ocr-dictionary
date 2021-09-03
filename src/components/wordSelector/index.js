import React, {Component} from 'react';

import {
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  View,
  Text,
  Button,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from 'react-native';

import Helper from '../../lib/helper';
import Modal from 'react-native-modal';
import {hp, wp} from '../../constants/theme';
import translate from 'translate-google-api';
import commonStyles from '../../../commonStyles';
import {COLORS, FONTS, Icons} from '../../constants';
import Icon from 'react-native-vector-icons/Ionicons';
import Camera, {Constants} from '../../components/camera';
import Toast from 'react-native-toast-message';

let whichLang = 'mn';
let displayLang = 'MОНГОЛ ХЭЛ';

const langImg = {
  mn: require('../../../assets/mongolia.png'),
  fr: require('../../../assets/france.png'),
  ru: require('../../../assets/russia.png'),
  it: require('../../../assets/italy.png'),
  sw: require('../../../assets/sweden.png'),
  de: require('../../../assets/germany.png'),
  ko: require('../../../assets/south-korea.png'),
  cz: require('../../../assets/czech-republic.png'),
  en: require('../../../assets/united-states.png'),
  tr: require('../../../assets/turkey.png'),
};

export default class WordSelector extends Component {
  state = {
    selectedWordIdx: -1,
    wordList: null,
    userWord: '',
    errorMsg: '',
    loading: false,
    definition: null,
    showCamera: false,
    showWordList: false,
    recogonizedText: null,
    selectedWord: null,
    modalShown: false,
    langModal: false,
    translatedWord: null,
    startingIdx: null,
    endingIdx: null,
    mySentence: [],
  };

  componentDidMount() {
    // Break down all the words detected by the camera
  }

  onOCRCapture(recogonizedText) {
    let wordList = [];

    if (
      recogonizedText &&
      recogonizedText.textBlocks &&
      recogonizedText.textBlocks.length > 0
    ) {
      console.log(`recogonizedText.textBlocks`, recogonizedText.textBlocks);
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
      console.log(`wordList`, wordList);
    }

    this.setState({
      showCamera: false,
      showWordList: Helper.isNotNullAndUndefined(recogonizedText),
      recogonizedText: recogonizedText,
    });
  }

  myToast = () => {
    Toast.show({
      type: 'success',
      // autoHide: false,
      // text1: 'орчуулга',
      text1:
        this.state.translatedWord != null
          ? this.state.translatedWord
          : 'oрчуулж байна.',
    });
  };

  async _transleFunction(idx) {
    const result = await translate(this.state.wordList[idx], {
      tld: 'cn',
      to: whichLang,
    });

    this.setState({
      translatedWord: result,
    });
  }

  async _transleFunctionSentence(words) {
    let tempArr = words;
    let newArr = [];
    for (let i = 0; i < tempArr.length; i++) {
      newArr.push(tempArr[i].word);
    }
    newArr = newArr.join('-');
    newArr = await newArr.replace(/-/g, ' ');
    const result = await translate(newArr, {
      // tld: 'cn',
      to: whichLang,
    });
    console.log(`result`, result);
    this.setState({
      translatedWord: result,
      translateLoad: false,
    });
  }

  populateWords = () => {
    const wordViews = [];
    if (this.state.wordList && this.state.wordList.length > 0) {
      for (let idx = 0; idx < this.state.wordList.length; idx++) {
        wordViews.push(
          <TouchableHighlight
            key={'Word_' + idx}
            underlayColor={'#80ED99'}
            onPress={async () => {
              // this._transleFunction(idx);
              if (this.state.startingIdx == null) {
                await this.setState({startingIdx: idx});
              } else if (this.state.endingIdx == null) {
                await this.setState({endingIdx: idx});
                this.createSentence();
              } else if (idx > this.state.endingIdx) {
                await this.setState({endingIdx: idx});
                this.createSentence();
              } else if (idx < this.state.startingIdx) {
                await this.setState({startingIdx: idx});
              } else if (
                idx < this.state.endingIdx &&
                idx > (this.state.endingIdx + this.state.startingIdx) / 2
              ) {
                await this.setState({endingIdx: idx});
                this.createSentence();
              } else if (
                idx > this.state.startingIdx &&
                idx < (this.state.endingIdx + this.state.startingIdx) / 2
              ) {
                await this.setState({startingIdx: idx});
                this.createSentence();
              }
            }}
            onLongPress={async () => {
              await this._transleFunction(idx);
              this.myToast();
            }}
            style={
              this.state.startingIdx != null &&
              this.state.startingIdx <= idx &&
              this.state.mySentence[idx - this.state.startingIdx]?.selected
                ? styles.selectedWord
                : styles.nonSelectedWord
            }>
            <Text style={styles.word}>{this.state.wordList[idx]}</Text>
          </TouchableHighlight>,
        );
      }
    }

    return wordViews;
  };

  createSentence = async () => {
    const mySentence = [];
    let myWords = this.state.wordList;
    if (this.state.startingIdx || this.state.endingIdx != null) {
      let slicedWords = myWords.slice(
        this.state.startingIdx,
        this.state.endingIdx + 1,
      );
      if (slicedWords.length > 0) {
        for (let i = 0; i < slicedWords.length; i++) {
          mySentence.push({word: slicedWords[i], selected: true});
        }
      }
      this.setState({mySentence: mySentence});
    }
    return mySentence;
  };

  clearSelected() {
    this.setState({startingIdx: null, mySentence: [], endingIdx: null});
  }

  render() {
    return (
      <>
        <SafeAreaView style={[styles.container, this.props.style]}>
          <View
            style={{
              alignSelf: 'flex-end',
              margin: hp(2),
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

          <View>
            <ScrollView>
              <View style={styles.wordList}>{this.populateWords()}</View>
            </ScrollView>
          </View>
          <View style={styles.btnContainer}>
            <View
              style={[
                styles.btnstyle,
                {justifyContent: 'center', paddingHorizontal: wp(2)},
              ]}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({showCamera: true});
                }}>
                <Icon name="ios-camera" size={25} color={'white'} />
              </TouchableOpacity>
            </View>
            <View style={[styles.btnstyle, {marginHorizontal: wp(2)}]}>
              <Button
                title="арилгах"
                color="white"
                onPress={() => this.clearSelected()}
              />
            </View>
            <View style={styles.btnstyle}>
              <Button
                title="орчуулах"
                color="white"
                onPress={async () => {
                  await this._transleFunctionSentence(this.state.mySentence);
                  this.setState({modalShown: true});
                }}
              />
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
                        color: COLORS.brand,
                        fontFamily: 'SFProRounded-Bold',
                      }}>
                       ОРЧУУЛГА {`\n\n`}
                    </Text>
                    {this.state.translatedWord}
                  </Text>
                </ScrollView>
              )}
            </View>
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
        <Toast ref={ref => Toast.setRef(ref)} />
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
    height: hp(45),
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
    backgroundColor: COLORS.brand,
  },
});
