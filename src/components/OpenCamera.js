import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraType } from 'expo-camera';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import DescriptionPage from '../screens/DescriptionPage';
import { deleteImage, sendImageToApi } from './requests';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'new NativeEventEmitter()',
  // Any other warnings you want to ignore
]);

export default function OpenCamera() {
  const [type, setType] = useState(CameraType.back);
  const [permission, setPermission] = useState(null);
  const cameraRef = useRef(null);
  const [image, setImage] = useState(null);
  const [lang, setLang] = useState("en");
  const [response, setResponse] = useState(null);
  const sound = useRef(null);

  async function requestPermission() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
    }
  }
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    setImage(result.assets[0].uri,lang);
    if (!result.canceled) {
      await loadAudio();
      await playAudio();
      // Use the URI of the selected image
      console.log("Image taken succesfully");
    }
    const response = await sendImageToApi(result.assets[0].uri,lang);
    setResponse(response);
    await stopMusic()
  };
  
  

  useEffect(() => {
    requestPermission();
    (async () => {
      const {granted} = await Camera.requestCameraPermissionsAsync();
      setPermission(granted);
      // Initialize Audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      sound.current = new Audio.Sound();
    })();
  }, []);

  if (permission === null) {
    return <View><Text>Requesting permissions...</Text></View>;
  } else if (!permission) {
    return <View><Text>No access to Camera</Text></View>;
  }

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        await loadAudio();
        await playAudio();
        const { uri } = await cameraRef.current.takePictureAsync();
  
        // Resize the image to 512x512
        const resizedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 512, height: 512 } }],
          { compress: 1, format: ImageManipulator.SaveFormat.PNG }
        );
  
        setImage(resizedImage.uri); // Update your state with the resized image URI
        const res = await sendImageToApi(resizedImage.uri, lang); // Send the resized image to your API
        setResponse(res);
        await stopMusic();
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  }

  const stopMusic = async () => {
    try {
      await sound.current.stopAsync();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const reTakePhoto = () => {
    deleteImage(response?.photo);
    setImage(null);
    setResponse(null);
    Speech.stop();
    stopMusic();
  };

  const loadAudio = async () => {
    try {
      const status = await sound.current.getStatusAsync();
      if (!status.isLoaded) {
        await sound.current.loadAsync(require('../../assets/waiting.mp3'));
        console.log('Audio loaded successfully');
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const playAudio = async () => {
    try {
      await sound.current.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    image?
    <DescriptionPage image={image} reTake={reTakePhoto} description={response} lang={lang}/>:
    <Camera type={type} className="flex-1 w-full flex items-center" ref={cameraRef}>
        <View className="flex flex-row mt-3 absolute right-8 top-5">
            <TouchableOpacity><Text className={`${lang=='en'?"text-gray-700":"text-white"} px-3 bold text-2xl font-bold`} onPress={()=>setLang('en')}>EN</Text></TouchableOpacity>
            <TouchableOpacity><Text className={`${lang=='ru'?"text-gray-700":"text-white"} px-3 bold text-2xl font-bold`} onPress={()=>setLang('ru')}>RU</Text></TouchableOpacity>
            <TouchableOpacity><Text className={`${lang=='uz'?"text-gray-700":"text-white"} px-3 bold text-2xl font-bold`} onPress={()=>setLang('uz')}>UZ</Text></TouchableOpacity>
        </View>
        <TouchableOpacity className="absolute bottom-[100px] left-12" onPress={pickImage}>
          <FontAwesome5 name="images" size={50} color="white"/>
        </TouchableOpacity>
        <View className="absolute bottom-20 flex flex-row items-center justify-between border-4 border-white p-1 rounded-full">
            <TouchableOpacity 
                className="bg-white w-[80px] h-[80px] rounded-full"
                ccessibilityLabel={lang=="en"?"Take a picture":lang=="ru"?"Сделать фото":"Rasmga olish"} 
                accessibilityHint={lang=="en"?"Take a picture":lang=="ru"?"Сделать фото":"Rasmga olish"}
                onPress={handleTakePicture}
            >
            </TouchableOpacity>
        </View>
    </Camera>
  )
}