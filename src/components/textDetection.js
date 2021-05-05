import React, {Component} from 'react';
import {Button, Text, View} from 'react-native';
import {RNCamera} from 'react-native-camera';
// import {showMessage} from 'react-native-flash-message';

export default class ProductScanRNCamera extends React.Component {
  state = {};

  constructor(props) {
    super(props);
    this.camera = null;
    this.barcodeCodes = [];

    this.state = {
      camera: {
        type: RNCamera.Constants.Type.back,
        flashMode: RNCamera.Constants.FlashMode.auto,
      },
      canDetectBarcode: true,
      barcode: null,
      focusedScreen: true,
    };
  }

  // componentDidMount() {
  //   const {navigation} = this.props;
  //   navigation.addListener('willFocus', () => {
  //     this.setState({focusedScreen: true});
  //     console.log('focused??????');
  //   });
  //   navigation.addListener('willBlur', () =>
  //     this.setState({focusedScreen: false}),
  //   );
  // }

  onBarCodeRead(scanResult) {
    this.props.ReadBC(scanResult.data);

    if (scanResult.data != null) {
      this.setState({canDetectBarcode: false, barcode: scanResult.data});
      this.camera.pausePreview();
      console.log('scanResult.data', scanResult.data);
    }

    return;
  }

  //   toNavigateRegister2 = navigation => {
  //     if (this.state.barcode == null) {
  //       // alert('Scan barcode');
  //       this.props.showMsg();
  //     } else {
  //       navigation.navigate('Register2', {
  //         barcode: this.state.barcode,
  //       });
  //     }
  //   };

  //   toNavigateUsers = navigation => {
  //     if (this.state.barcode == null) {
  //       showMessage({
  //         message: 'Scan Barcode',
  //         type: 'info',
  //       });
  //     } else {
  //       navigation.navigate('Users', {
  //         barcode: this.state.barcode,
  //       });
  //     }
  //   };

  clearBarcode = () => {
    this.camera.resumePreview();
    this.state.barcode = null;
    console.log('resume hiigdlee :>> ', 'resume hiigdlee');
  };

  async takePicture() {
    if (this.camera) {
      const options = {quality: 0.5, base64: true};
      const data = await this.camera.takePictureAsync(options);
      console.log(data.uri);
    }
  }

  pendingView() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'lightgreen',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text>Waiting</Text>
      </View>
    );
  }

  render() {
    if (this.state.focusedScreen == false) {
      return null;
    }
    return (
      <RNCamera
        ref={ref => {
          this.camera = ref;
        }}
        style={styles.preview}
        defaultTouchToFocus
        flashMode={this.state.camera.flashMode}
        mirrorImage={false}
        onBarCodeRead={this.onBarCodeRead.bind(this)}
        onFocusChanged={() => {}}
        onZoomChanged={() => {}}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        captureAudio={false}
        type={this.state.camera.type}
      />
    );
  }
}

const styles = {
  preview: {
    // flex: 1,
    width: 300,
    alignSelf: 'center',
    height: 100,
    borderRadius: 10,
    marginVertical: 20,
    overflow: 'hidden',
  },
};
