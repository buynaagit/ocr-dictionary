import {Dimensions, PixelRatio, Platform} from 'react-native';
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const scale = SCREEN_WIDTH / 320;
export const actOpacity = Platform.OS == 'ios' ? 0.2 : 0.4;
export function ft(size) {
  const newSize = size * scale;
  if (Platform.OS == 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

export const wp = widthPercent => {
  const screenWidth = Dimensions.get('window').width;
  const elemWidth = parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
};

export const hp = heightPercent => {
  const screenHeight = Dimensions.get('window').height;
  const elemHeight = parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
};

export const FONTS = {
  text1: {fontFamily: 'SFProRounded-Regular', fontSize: ft(13)},
  text2: {fontFamily: 'SFProRounded-Heavy', fontSize: ft(22)},
  text3: {fontFamily: 'SFProRounded-Heavy', fontSize: ft(17)},
  text4: {fontFamily: 'SFProRounded-Heavy', fontSize: ft(12)},
  text5: {fontFamily: 'SFProRounded-Regular', fontSize: ft(17)},
  index: {fontFamily: 'SFProRounded-Heavy', fontSize: ft(14)},
  score: {fontFamily: 'SFProRounded-Black', fontSize: ft(18)},
  buttonText1: {fontFamily: 'SFProRounded-Black', fontSize: ft(16)},
  buttonText2: {fontFamily: 'SFProRounded-Black', fontSize: ft(10)},
  buttonText3: {fontFamily: 'SFProRounded-Heavy', fontSize: ft(9)},
  buttonText4: {fontFamily: 'SFProRounded-Heavy', fontSize: ft(16)},
  modalButtonText: {fontFamily: 'SFProRounded-Heavy', fontSize: ft(15)},
  dateAndBtnText: {fontFamily: 'SFProRounded-Heavy', fontSize: ft(15)},
  modalText1: {fontFamily: 'SFProRounded-Heavy', fontSize: ft(18)},
  modalText2: {fontFamily: 'SFProRounded-Light', fontSize: ft(12)},
  genderText: {fontFamily: 'SFProRounded-Light', fontSize: ft(13)},
  playertext: {fontFamily: 'SFProRounded-Light', fontSize: ft(14)},
  warningText: {fontFamily: 'SFProRounded-Light', fontSize: ft(10)},
  TextInputTitle: {fontFamily: 'SFProRounded-Bold', fontSize: ft(13)},
};

export const COLORS = {
  brand: '#FF3366',
  white: '#FFFFFF',
  green: '#AFD224',
  text: '#333333',
  greenText: '#06CF90',
  yellow: '#FED130',
  grey: '#E3E1E1',
  warningText: '#C3902E',
  warningContainer: '#F4B43A',
  genderText: '#919191',
};

export const SIZES = {};

const appTheme = {COLORS, SIZES, FONTS};
export default appTheme;
