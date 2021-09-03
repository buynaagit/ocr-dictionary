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
  chooselangText: {fontFamily: 'SFProRounded-Bold', fontSize: ft(11)},
  chooseLangText2: {fontFamily: 'SFProRounded-Regular', fontSize: ft(9)},
  modalHeaderText: {fontFamily: 'SFProRounded-Heavy', fontSize: ft(22)},
  SelectLanguageText: {fontFamily: 'SFProRounded-Heavy', fontSize: ft(16)},
  SelectedLanguageText: {fontFamily: 'SFProRounded-Semibold', fontSize: ft(10)},
  DetectedText: {
    fontFamily: 'SFProRounded-Regular',
    fontSize: ft(14),
  },
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

const appTheme = {COLORS, FONTS};
export default appTheme;
