import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';

import Sound from 'react-native-sound';
import Toast from 'react-native-toast-message';
import Copy from 'react-native-vector-icons/AntDesign';
import ArrowIcon from 'react-native-vector-icons/AntDesign';
import Clipboard from '@react-native-clipboard/clipboard';
import Save from 'react-native-vector-icons/FontAwesome';
import SoundIcon from 'react-native-vector-icons/AntDesign';
import {FONTS, wp, hp, COLORS, ft} from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Translation = props => {
  const [antonyms_, setAntonyms] = useState(false);
  const [synonyms_, setSynonyms] = useState(false);
  const [isMp3Loading, setMp3Loading] = useState(false);
  const [myData, setmyData] = useState(
    props.data ? props.data : props.route.params.data,
  );

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
        Toast.show({
          type: 'error',
          text1: 'failed to load the sound',
        });
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

  const storeData = async value => {
    console.log('value', value);
    let arr = [];
    try {
      const favWords = await AsyncStorage.getItem('@favWords');
      if (favWords !== null) {
        arr = JSON.parse(favWords);
        console.log('arr', arr);
        console.log('getDatafromAsync', arr);
      }
    } catch (e) {
      console.log('error storeData Async', e);
    }
    if (arr.length == 0) {
      try {
        arr.push({key: 0, word: value});
        console.log('arr', arr);
        const jsonValue = JSON.stringify(arr);
        props.setSaved(true);
        await AsyncStorage.setItem('@favWords', jsonValue);
      } catch (e) {
        // saving error
      }
    } else if (arr.filter(e => e.word === value).length > 0) {
      Toast.show({
        type: 'error',
        text1: 'You have already saved the word',
      });
    } else {
      try {
        arr.push({key: parseInt(arr[arr.length - 1].key) + 1, word: value});
        console.log('arr', arr);
        const jsonValue = JSON.stringify(arr);
        props.setSaved(true);
        await AsyncStorage.setItem('@favWords', jsonValue);
      } catch (e) {
        // saving error
      }
    }
  };

  return (
    <SafeAreaView style={{backgroundColor: 'white'}}>
      {props.data == null && (
        <TouchableOpacity
          style={{position: 'absolute', top: 70, left: 20, zIndex: 10}}
          onPress={() => props.navigation.pop()}>
          <ArrowIcon name="left" size={wp(6)} color={COLORS.brandGray2} />
        </TouchableOpacity>
      )}
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
            {myData.word}
          </Text>
          {myData.phonetics.length > 0 && (
            <TouchableOpacity
              disabled={isMp3Loading}
              onPress={() => {
                playPronunciation(myData.phonetics);
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
          {myData.meanings.map((e, index) => (
            <View style={{marginRight: 5}}>
              <Text style={styles.partOfSpeech}>{e.partOfSpeech}</Text>
            </View>
          ))}
        </View>

        <View>
          <Text style={styles.phonetic}>{myData.phonetic}</Text>
        </View>
      </View>

      <ScrollView style={styles.definitionContainer}>
        <View style={styles.utilyIcons}>
          <TouchableOpacity
            onPress={() => {
              copyToClipboard(myData.word);
            }}
            style={{justifyContent: 'center', marginRight: 10}}>
            <Copy name="copy1" size={wp(7)} color={COLORS.brandGray2} />
          </TouchableOpacity>
          {props.data && (
            <TouchableOpacity
              onPress={() => storeData(myData.word)}
              style={styles.buttonBookmark}>
              {props.saved ? (
                <Save name="bookmark" size={wp(7)} color={COLORS.brandGray2} />
              ) : (
                <Save
                  name="bookmark-o"
                  size={wp(7)}
                  color={COLORS.brandGray2}
                />
              )}
            </TouchableOpacity>
          )}
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
              {myData.meanings.map((e, index) => (
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
              {myData.meanings.map((e, index) => (
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
            {myData.meanings.map((e, index) => (
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
      {props.data == null && <Toast ref={ref => Toast.setRef(ref)} />}
    </SafeAreaView>
  );
};

export default Translation;

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
    backgroundColor: 'white',
  },
  definitionContainer: {
    backgroundColor: '#F6F6F5',
    width: wp(100),
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
