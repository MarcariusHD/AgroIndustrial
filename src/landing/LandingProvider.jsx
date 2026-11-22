import { LandingContext } from './LandingContext';
import useLandingState from './useLandingState';

export default function LandingProvider({ children, ...props }) {
  const state = useLandingState(props);
  return <LandingContext.Provider value={{ ...props, ...state }}>{children}</LandingContext.Provider>;
}
