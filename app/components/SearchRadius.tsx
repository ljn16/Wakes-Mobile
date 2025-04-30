import React from 'react';
import { View, Text } from 'react-native';
import CustomSlider from './subcomponents/CustomSlider';

export type PositiveSlidersProps = {
  vehiclePrice: number;
  setVehiclePrice: (v: number) => void;
  vehiclePricePanHandlers: any;
  onVehiclePriceLayout: (e: any) => void;
  accessories: number;
  setAccessories: (v: number) => void;
  accessoriesPanHandlers: any;
  onAccessoriesLayout: (e: any) => void;
};

const PositiveSliders: React.FC<PositiveSlidersProps> = ({
  vehiclePrice,
  setVehiclePrice,
  vehiclePricePanHandlers,
  onVehiclePriceLayout,
  accessories,
  setAccessories,
  accessoriesPanHandlers,
  onAccessoriesLayout,
}) => (
  <View style={{ position: 'relative', width: '100%', marginVertical: 20 }}>
    {/* Vehicle Price Slider */}
    <CustomSlider
      label="Vehicle Price"
      value={vehiclePrice}
      onValueChange={setVehiclePrice}
      panHandlers={vehiclePricePanHandlers}
      onLayout={onVehiclePriceLayout}
      min={5000}
      max={100000}
      step={500}
      fillColor="#e53935"
    />

    {/* Accessories Slider */}
    <CustomSlider
      label="Accessories"
      value={accessories}
      onValueChange={setAccessories}
      panHandlers={accessoriesPanHandlers}
      onLayout={onAccessoriesLayout}
      min={0}
      max={10000}
      step={250}
      fillColor="#e53935"
    />


  </View>
);

export default PositiveSliders;