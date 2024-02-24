import { View, Text,TouchableOpacity } from 'react-native'
import React, {useState,useEffect,useRef} from 'react'
import {Camera,CameraType} from 'expo-camera'
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import DescriptionPage from '../screens/DescriptionPage';
import { deleteImage, sendImageToApi } from './requests';

export default function OpenCamera() {
  const [type, setType] = useState(CameraType.back);
  const [permission, setPermission] = useState();
  const cameraRef = useRef(null);
  const [image,setImage] = useState();
  const [lang,setLang] = useState("en");
  const[response,setResponse] = useState();
  const sound = useRef(new Audio.Sound());
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);


  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setPermission(cameraStatus.status === 'granted');
    })();
  }, []);

  if(!permission){
    return <Text>No acces to Camera</Text>
  }

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        await loadAudio();
        await playAudio(); 
        setIsMusicLoaded(true);
        const { uri } = await cameraRef.current.takePictureAsync();
        setImage(uri);
        const res = await sendImageToApi(uri,lang);
        setResponse(res);
        stopMusic();
        // Handle the taken picture URI as needed (e.g., save to device, upload, display, etc.)
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const stopMusic = async () => {
    try {
      await sound.current.stopAsync();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const reTakePhoto = ()=>{
    deleteImage(response?.photo);
    setImage(null);
    setResponse(null);
    Speech.stop();
    stopMusic();
  }
  const loadAudio = async () => {
    if (sound.current != null) {
      // Check if the sound is already loaded
      if (sound.current.getStatusAsync().isLoaded) {
        console.log('Audio is already loaded');
        return;
      }
    }

    try {
      sound.current = new Audio.Sound();
      await sound.current.loadAsync(require('../../assets/waiting.mp3'));
      console.log('Audio loaded successfully');
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const playAudio = async () => {
    try {
      await sound.current.replayAsync();
      setIsMusicPlaying(true);
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