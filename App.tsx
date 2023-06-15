/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const cameraRef = React.useRef<Camera>(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const devices = useCameraDevices('wide-angle-camera');
  const device = devices.front;

  React.useEffect(() => {
    // check permission
    // request permission
    (async () => {
      const cameraPermission = await Camera.getCameraPermissionStatus();
      if (cameraPermission === 'denied') {
        await Camera.requestCameraPermission();
      }

      requestWriteExternalStoragePermission();
    })();
  }, []);

  const requestWriteExternalStoragePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs storage permission to save photos.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Storage permission denied');
        }
      }
    } catch (error) {
      console.log('Error requesting storage permission:', error);
    }
  };

  const takePhoto = React.useCallback(async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        skipMetadata: true,
      });

      console.log({path: photo.path});
      savePhoto(photo.path);
    }
  }, [cameraRef]);

  async function savePhoto(path: string) {
    try {
      console.log({path});
      const filename = `${Date.now()}.jpg`;
      const fullPath = `${RNFS.ExternalDirectoryPath}/${filename}`;

      await RNFS.moveFile(path, fullPath);
    } catch (e) {
      console.log({e});
    }
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={takePhoto} style={styles.button}>
            <Text style={styles.buttonText}>Take Pick</Text>
          </TouchableOpacity>
        </View>
        {device && (
          <Camera
            ref={cameraRef}
            photo={true}
            style={styles.fullScreen}
            device={device}
            isActive={true}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    backgroundColor: 'blue',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    zIndex: 10,
    paddingVertical: 16,
  },
  button: {
    paddingVertical: 32,
    paddingHorizontal: 48,
    borderRadius: 48,
    backgroundColor: 'blue',
  },
  buttonText: {
    color: 'white',
  },
});

export default App;
