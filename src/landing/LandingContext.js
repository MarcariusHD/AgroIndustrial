import { createContext, useContext } from 'react';

export const LandingContext = createContext(null);

export function useLanding() {
  const value = useContext(LandingContext);
  if (!value) throw new Error('La vista requiere LandingProvider');
  return value;
}
