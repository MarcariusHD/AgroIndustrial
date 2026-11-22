import LandingHome from './LandingHome';
import LandingGreenhouse from './LandingGreenhouse';
import LandingSeasons from './LandingSeasons';
import LandingCrops from './LandingCrops';
import { useLanding } from './LandingContext';

export default function LandingContent() {
  const { currentView } = useLanding();
  switch (currentView) {
    case 'temporada': return <LandingSeasons />;
    case 'cultivo': return <LandingCrops />;
    case 'invernadero': return <LandingGreenhouse />;
    default: return <LandingHome />;
  }
}
