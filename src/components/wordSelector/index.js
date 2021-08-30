import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  View,
  Text,
  Button,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import {COLORS, SIZES, FONTS} from '../../constants';
import Icon from 'react-native-vector-icons/AntDesign';

export default class WordSelector extends Component {
  state = {
    selectedWordIdx: -1,
    wordList: null,
  };

  componentDidMount() {
    let wordList = [];

    // Break down all the words detected by the camera
    if (
      this.props.wordBlock &&
      this.props.wordBlock.textBlocks &&
      this.props.wordBlock.textBlocks.length > 0
    ) {
      for (let idx = 0; idx < this.props.wordBlock.textBlocks.length; idx++) {
        let text = this.props.wordBlock.textBlocks[idx].value;
        if (text && text.trim().length > 0) {
          let words = text.split(/[\s,.?]+/);
          if (words && words.length > 0) {
            for (let idx2 = 0; idx2 < words.length; idx2++) {
              if (words[idx2].length > 0) wordList.push(words[idx2]);
            }
          }
        }
      }

      this.setState({wordList: wordList});
    }
  }

  // Pupulate the words UI for the user to select
  populateWords() {
    const wordViews = [];

    if (this.state.wordList && this.state.wordList.length > 0) {
      for (let idx = 0; idx < this.state.wordList.length; idx++) {
        wordViews.push(
          <TouchableHighlight
            key={'Word_' + idx}
            underlayColor={'#d6f9ff'}
            onPress={() => {
              this.setState({selectedWordIdx: idx});
            }}
            style={
              this.state.selectedWordIdx == idx
                ? styles.selectedWord
                : styles.nonSelectedWord
            }>
            <Text style={styles.word}>{this.state.wordList[idx]}</Text>
          </TouchableHighlight>,
        );
      }
    }

    return wordViews;
  }
  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        {/* <View style={{position: 'absolute', left: 10, margin: 10}}>
          <TouchableOpacity
            style={styles.searchCamera}
            onPress={() => {
              navigation.navigate('textDetection');
            }}>
            <Icon name="arrowleft" size={25} color={COLORS.brand} />
          </TouchableOpacity>
        </View> */}
        <View
          style={{
            borderRadius: 14,
            backgroundColor: COLORS.brand,
            width: '50%',
            alignSelf: 'center',
            marginTop: 10,
          }}>
          <Button
            title="СОНГОХ"
            color="white"
            disabled={
              !(
                this.state.selectedWordIdx >= 0 &&
                this.state.wordList &&
                this.state.wordList.length > this.state.selectedWordIdx
              )
            }
            onPress={() => {
              this.props.onWordSelected &&
                this.props.onWordSelected(
                  this.state.wordList[this.state.selectedWordIdx],
                );
            }}
          />
        </View>
        <View
          style={{
            borderColor: COLORS.brand,
            borderRightWidth: 1,
            borderLeftWidth: 1,
          }}>
          <ScrollView>
            <View style={styles.wordList}>{this.populateWords()}</View>
          </ScrollView>
        </View>

        <View style={{minHeight: 30}}></View>
      </View>
    );
  }
}

WordSelector.propTypes = {
  wordBlock: PropTypes.object,
  onWordSelected: PropTypes.func,
};

WordSelector.defaultProps = {
  wordBlock: null,
  onWordSelected: null,
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'white',
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
    paddingBottom: 70,
    paddingTop: 10,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
  },
  selectedWord: {
    flex: 0,
    borderRadius: 10,
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
});
