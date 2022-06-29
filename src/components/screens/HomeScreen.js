import React, {useState} from 'react';

import {
  View,
  Text,
  Button,
  TextInput,
  Platform,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import Sound from 'react-native-sound';
import Toast from 'react-native-toast-message';
import Copy from 'react-native-vector-icons/AntDesign';
import IconCam from 'react-native-vector-icons/Ionicons';
import Search from 'react-native-vector-icons/EvilIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import Save from 'react-native-vector-icons/FontAwesome';
import SoundIcon from 'react-native-vector-icons/AntDesign';

import {hp, wp, FONTS, COLORS, ft} from '../../constants/theme';

import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({navigation}) => {
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const [antonyms_, setAntonyms] = useState(false);
  const [synonyms_, setSynonyms] = useState(false);
  const [oxfordDef, setOxfordDef] = useState(null);
  const [isMp3Loading, setMp3Loading] = useState(false);

  const axios = require('axios');

  const playPronunciation = data => {
    let audioSource;
    data.forEach((e, index) => {
      if (e.audio != '') {
        audioSource = e.audio;
      }
    });
    playWord(audioSource);
  };

  const playWord = speakMp3 => {
    setMp3Loading(true);

    console.log('Playing ', speakMp3);
    // Enable playback in silence mode
    Sound.setCategory('Playback');

    // See notes below about preloading sounds within initialization code below.
    var player = new Sound(speakMp3, null, error => {
      if (error) {
        console.log('failed to load the sound', error);
        setMp3Loading(false);
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
        setMp3Loading(false);
        player.release();
      });
    });
  };

  const copyToClipboard = word => {
    Clipboard.setString(word);
    Toast.show({
      type: 'success',
      text1: 'Copied',
    });
  };

  const oxfordTranslation = async word => {
    axios
      .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then(response => {
        // handle success
        setOxfordDef(response.data[0]);
        console.log('first', oxfordDef);
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

  const searchBtn = val => {
    if (val) {
      oxfordTranslation(val);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{flexDirection: 'row', alignSelf: 'center'}}>
        <View style={styles.searchContainer}>
          <TouchableOpacity
            onPress={() => searchBtn(search)}
            style={{
              marginLeft: wp(3),
              paddingVertical: hp(1.5),
            }}>
            <Search
              name={'search'}
              size={25}
              style={{
                color: 'gray',
              }}
            />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.searchInputStyle,
              {
                color: 'black',
              },
            ]}
            returnKeyLabel={'search'}
            returnKeyType={'search'}
            onEndEditing={() => searchBtn(search)}
            onSubmitEditing={() => searchBtn(search)}
            placeholder="Search for words"
            placeholderTextColor="rgba(172, 180, 195, 1)"
            onChangeText={e => {
              setSearch(e);
            }}
          />
          <View
            style={[
              styles.cameraIcon,
              {
                justifyContent: 'center',
                paddingHorizontal: 15,
                paddingVertical: 5,
              },
            ]}>
            <TouchableOpacity
              onPress={async () => {
                navigation.navigate('WordSelector');
                // this.English2English();
              }}>
              <IconCam
                name="ios-camera"
                size={wp(8)}
                color={COLORS.brandGray2}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {oxfordDef && (
        <View style={{flex: 1}}>
          <View style={styles.wordInfoContainer}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text
                style={[
                  FONTS.modalHeaderText,
                  {
                    color: 'black',
                    textAlign: 'center',
                    fontSize: ft(30),
                  },
                ]}>
                {oxfordDef.word}
              </Text>
              {oxfordDef.phonetics.length > 0 && (
                <TouchableOpacity
                  disabled={isMp3Loading}
                  onPress={() => {
                    playPronunciation(oxfordDef.phonetics);
                  }}
                  style={{justifyContent: 'center', marginLeft: 20}}>
                  <SoundIcon
                    name="sound"
                    size={wp(8)}
                    color={isMp3Loading ? 'gray' : COLORS.brandGray2}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginVertical: wp(2),
              }}>
              {oxfordDef.meanings.map((e, index) => (
                <View style={{marginRight: 5}}>
                  <Text style={styles.partOfSpeech}>{e.partOfSpeech}</Text>
                </View>
              ))}
            </View>

            <View>
              <Text style={styles.phonetic}>{oxfordDef.phonetic}</Text>
            </View>
          </View>

          <ScrollView style={styles.definitionContainer}>
            <View style={styles.utilyIcons}>
              <TouchableOpacity
                onPress={() => {
                  copyToClipboard(oxfordDef.word);
                }}
                style={{justifyContent: 'center', marginRight: 10}}>
                <Copy name="copy1" size={wp(7)} color={COLORS.brandGray2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSaved(!saved)}
                style={styles.buttonBookmark}>
                {saved ? (
                  <Save
                    name="bookmark"
                    size={wp(7)}
                    color={COLORS.brandGray2}
                  />
                ) : (
                  <Save
                    name="bookmark-o"
                    size={wp(7)}
                    color={COLORS.brandGray2}
                  />
                )}
              </TouchableOpacity>
            </View>
            <View
              style={{
                paddingBottom: hp(30),
                paddingTop: wp(10),
                paddingHorizontal: wp(7),
              }}>
              {/* {`Synonyms`} */}
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {oxfordDef.meanings.map((e, index) => (
                    <>
                      {e.synonyms.map((element, index_) => (
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
                                  fontFamily: 'SFProRounded-Regular',
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
              {/* {'Antonyms'} */}
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                                  fontFamily: 'SFProRounded-Regular',
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
                <Text style={[FONTS.DetectedText, {textAlign: 'center'}]}>
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
                      {e.definitions.slice(0, 3).map((element, index_) => (
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
                                fontFamily: 'SFProRounded-Semibold',
                                color: COLORS.brandGray,
                              }}>
                              {index_ + 1}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontFamily: 'SFProRounded-Regular',
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
      )}
      <Toast ref={ref => Toast.setRef(ref)} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    flex: 1,
  },
  searchInputStyle: {
    paddingLeft: wp(3),
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    fontSize: ft(10),
    flex: 1,
    width: '100%',
    height: '100%',
    fontFamily: 'SFProRounded-Semibold',
  },
  searchContainer: {
    flexDirection: 'row',
    width: wp(90),
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(243, 245, 249, 1)',
    borderRadius: 15,
  },
  wordInfoContainer: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  definitionContainer: {
    backgroundColor: '#F6F6F5',
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
  },
  utilyIcons: {
    flexDirection: 'row',
    position: 'absolute',
    top: 5,
    right: 30,
    zIndex: 5,
  },
});
