import {View } from 'react-native'
import React from 'react'
import OpenCamera from '../components/OpenCamera'

const HomePage = () => {
  return (
    <View className = "flex-1 flex items-center justify-center bg-red-500">
      <OpenCamera />
    </View>
  )
}

export default HomePage
