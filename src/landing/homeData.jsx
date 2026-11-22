import { projectCrops } from '../landingData';
import { Wind, Droplets, Sun, Zap, ShieldAlert, Sparkles } from 'lucide-react';

export const homeFeatures = [
    { icon: <Droplets className="w-8 h-8" />, title: "Riego Inteligente", desc: "Sistemas automatizados que optimizan cada gota de agua, reduciendo el consumo un 40% sin comprometer la calidad del cultivo.", color: "blue" },
    { icon: <Sun className="w-8 h-8" />, title: "Monitoreo Solar", desc: "Sensores de radiación PAR que ajustan la iluminación suplementaria en tiempo real para maximizar la fotosíntesis.", color: "amber" },
    { icon: <ShieldAlert className="w-8 h-8" />, title: "Defensa Fitosanitaria", desc: "Detección temprana de plagas y enfermedades con protocolos de intervención orgánica y biológica integrada.", color: "red" },
    { icon: <Wind className="w-8 h-8" />, title: "Clima Controlado", desc: "Gestión precisa de temperatura, humedad y CO₂ para crear el microclima perfecto en cada sector productivo.", color: "emerald" },
    { icon: <Zap className="w-8 h-8" />, title: "Automatización Total", desc: "Actuadores inteligentes que responden a los datos de los sensores sin intervención humana, las 24 horas.", color: "purple" },
    { icon: <Sparkles className="w-8 h-8" />, title: "Análisis de Suelo", desc: "Perfiles edafológicos completos con mapeo de nutrientes, pH y conductividad para decisiones basadas en datos.", color: "teal" },
  ];

export const homeStats = [
    { value: "98.7", suffix: "%", label: "Eficiencia Hídrica" },
    { value: "4", suffix: "x", label: "Más Rendimiento" },
    { value: "365", suffix: "", label: "Días Operativos" },
    { value: "24", suffix: "/7", label: "Monitoreo Activo" },
  ];

export const homeSteps = [
    { num: "01", title: "Registra tu Invernadero", desc: "Crea tu perfil y agrega tus invernaderos con sus dimensiones, ubicación y tipo de estructura. El sistema se adapta a tu realidad.", icon: "🏗️" },
    { num: "02", title: "Configura los Sectores", desc: "Divide tu espacio en sectores de producción y asigna cultivos específicos. Define los parámetros ideales para cada uno.", icon: "📐" },
    { num: "03", title: "Monitorea en Tiempo Real", desc: "Visualiza la telemetría de humedad, temperatura, pH y radiación desde cualquier dispositivo, en cualquier momento.", icon: "📊" },
    { num: "04", title: "Cosecha con Confianza", desc: "Toma decisiones basadas en datos históricos y alertas predictivas. Maximiza tu producción y minimiza las pérdidas.", icon: "🌾" },
  ];

export const showcaseCrops = projectCrops.map(crop => ({
  name: crop.nombre,
  emoji: crop.emoji,
  img: crop.img,
  season: 'Achocalla · Invernadero',
  desc: crop.desc,
}));
