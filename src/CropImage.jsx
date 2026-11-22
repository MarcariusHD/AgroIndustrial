import { useState } from 'react';
import { API_BASE_URL } from './landingData';

export default function CropImage({ crop, className = '' }) {
  const [failedImage, setFailedImage] = useState(null);
  const name = crop.nombre || crop.name;
  const source = crop.img ? `${API_BASE_URL}/api/asset/IMG/${crop.img}` : null;
  if (!source || failedImage === source) {
    return <div role="img" aria-label={name} className={`flex items-center justify-center bg-emerald-100 text-5xl ${className}`}>{crop.emoji || '🌱'}</div>;
  }
  return <img src={source} alt={name} className={className} onError={() => setFailedImage(source)} />;
}
