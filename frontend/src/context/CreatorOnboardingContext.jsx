import React, { createContext, useContext, useState } from 'react';

const CreatorOnboardingContext = createContext();

export const useCreatorOnboarding = () => useContext(CreatorOnboardingContext);

export const CreatorOnboardingProvider = ({ children }) => {
  // We can store states like Instagram skip status, phone number, etc. here
  const [instagramSkipped, setInstagramSkipped] = useState(false);
  const [igData, setIgData] = useState(null); // Data fetched from Instagram callback
  
  return (
    <CreatorOnboardingContext.Provider value={{
      instagramSkipped,
      setInstagramSkipped,
      igData,
      setIgData
    }}>
      {children}
    </CreatorOnboardingContext.Provider>
  );
};
