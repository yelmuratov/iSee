import { View,Image,Text, TextInput, ScrollView } from 'react-native'
import React, {useEffect, useRef, useState} from 'react'
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import Button from '../components/Button';
import { sendTextToSpeechRequest, sendMessageToApi } from '../components/requests';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';

export default function DescriptionPage({image,reTake,description,lang}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('')
  const scrollViewRef = useRef(null);
  const [loaded,setLoaded] = useState(false);
  const sound = useRef(new Audio.Sound());

  useEffect(()=>{
    speak(description?.iSee);
  },[description?.iSee])

  const sendMessage = async(message)=>{
    updateScrollView();
    setText('');
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    try{
      const responseMessage = await sendMessageToApi(lang, description?.photo, message);
      speak(responseMessage?.iSee);
      setMessages(prev => [...prev, { role: 'assistant', content: responseMessage?.iSee }]);
    }catch(e){
      console.log("Error in send message");
    }
  }

  const updateScrollView = () => {
    scrollViewRef?.current?.scrollToEnd({ animated: true });
  }

  const loadAudio = async (musicPath) => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync({ uri: musicPath });
      sound.current = soundObject;
      console.log('Audio loaded successfully');
      
      const status = await sound.current.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await sound.current.playAsync();
        console.log('Audio playback started');
      }
    } catch (error) {
      console.error('Error loading or playing audio:', error);
    }
  };

  const stopMusic = async () => {
    try {
      await sound.current.stopAsync();
    } catch (error) {
      console.error('Error stopping audio in descr:', error);
    }
  };

  const speak = async(speechText) => {
  // Speak the text with specified language
  if(speechText){
      if(lang!='uz'){
        const begginningText = lang=='en'?"I see": "аи cии"
        try {
          Speech.speak(begginningText+ " " + speechText);
        } catch (error) {
          console.log("Error in text to speech");
        }
      }else{
        try{
          const res = await sendTextToSpeechRequest(await speechText);
          await loadAudio(res);
        }catch(e){
          console.log(e);
        }
      }
    }
  }


  return (
    <View className="flex-1 w-full">
        <View className="absolute right-5 top-[44%]" style={{zIndex:1}}>
            <FontAwesome name="share" size={35} color="white" />
        </View>
        <Image source={{uri:image}} className="h-[50%]"/>
        <View className="h-[50%] bg-gray-800 flex flex-start items-start">
        <ScrollView 
          ref={scrollViewRef}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          { description?
            <Text className="bg-emerald-500 text-white p-4 rounded-t-[30px] rounded-r-[30px] text-[18px] my-3 ml-2">
              {description?.iSee}
            </Text>:
              <LottieView style={{width:100,height:100}} source={require('../../assets/Loader.json')} speed={1} autoPlay loop />
          }
          {messages.map((mess, index) => {
          if (mess.role == 'assistant' == true){
            return (
              <View key={index} className="flex flex-row justify-start mr-20 my-3">
                <View
                  className="bg-emerald-500 px-4 py-2 rounded-t-[30px] rounded-r-[30px] ml-2  text-[18px]"
                >
                  <Text className='text-[18px] text-white'>{mess.content}</Text>
                </View>
              </View>
            )
          } else {
            //user input
            return (
              <View key={index} className="flex-row justify-end">
                <View
                  style={{
                    width: "70%"
                  }}
                  className="bg-white p-2 rounded-t-[10px] rounded-l-lg mr-1"
                >
                  <Text className='text-[18px]'>{mess.content}</Text>
                </View>
              </View>
            )
          }
        })}
        </ScrollView>
            <View className="flex flex-row w-[90%] items-center items-center bg-[#3C3E74] px-4 py-2 rounded-xl ml-5 my-5">
                <Button iconName={'camera'} size={40} onPress={()=>{reTake(); lang=='uz'?stopMusic():""}}/>
                <TextInput 
                  placeholder='Message...' 
                  placeholderTextColor={"white"} 
                  className="w-[70%] text-xl ml-5 text-white"
                  onChangeText={newMessage => {setText(newMessage)}}
                  defaultValue={text}
                />
                {text?<FontAwesome name="send-o" size={30} color="white" onPress={()=>sendMessage(text)} />:<MaterialIcons name="keyboard-voice" size={40} color="white"/>}
            </View>
        </View>
    </View>
  )
}