import React from 'react';
import { View, Text } from 'react-native';

export type CustomSliderProps = {
  label: string;
  value: number;
  onValueChange: (v: number) => void;
  panHandlers: any;
  onLayout: (e: any) => void;
  min: number;
  max: number;
  step: number;
  fillColor: string;
};

const CustomSlider: React.FC<CustomSliderProps> = ({
  label,
  value,
  onValueChange,
  panHandlers,
  onLayout,
  min,
  max,
  step,
  fillColor,
}) => (
  <View style={{ width: '100%', marginVertical: 4, paddingVertical: 2 }}>
    <View
      style={{
        width: '100%',
        height: 48,
        backgroundColor: '#333',
        borderRadius: 16,
        overflow: 'hidden',
      }}
      {...panHandlers}
      onLayout={onLayout}
    >
      <View
        style={{
          height: '100%',
          borderRadius: 16,
          width: `${((value - min) / (max - min)) * 100}%`,
          backgroundColor: fillColor,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingLeft: 16,
          zIndex: 1,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 14 }}>
          <Text style={{ fontWeight: 'normal' }}>{label}{'\n'}</Text>
          <Text style={{ fontWeight: 'bold' }}>{value.toLocaleString()} mi</Text>
        </Text>
      </View>
    </View>
  </View>
);

export default CustomSlider;