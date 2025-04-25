import React, { createContext, useState, useContext } from 'react';


type Lake = {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    route?: { latitude: number; longitude: number }[];
  };

type LakeContextType = {
  selectedLake: Lake | null;
  selectLake: (lake: Lake | null) => void;
};

const LakeContext = createContext<LakeContextType | undefined>(undefined);

export const LakeProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedLake, setSelectedLake] = useState<Lake | null>(null);

  const selectLake = (lake: Lake | null) => {
    setSelectedLake(lake);
  };

  return (
    <LakeContext.Provider value={{ selectedLake, selectLake }}>
      {children}
    </LakeContext.Provider>
  );
};

export const useLake = () => {
  const context = useContext(LakeContext);
  if (!context) {
    throw new Error('useLake must be used within a LakeProvider');
  }
  return context;
};