import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Ionicons for icons

const Button = ({ onPress, iconName,accessibilityHint,accessibilityLabel,size }) => {
  return (
    <TouchableOpacity onPress={onPress} accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint}>
      {iconName && <Ionicons name={iconName} size={size?size:24} color="white" style={{ marginRight: 5 }} />}
    </TouchableOpacity>
  );
}

export default Button;
