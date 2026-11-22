import { homeFeatures, homeStats, homeSteps, showcaseCrops } from './homeData';
import { getPlants, getIconForPlant } from './plantUtils';
import { useState, useEffect } from 'react';
import { useGreenhouses } from '../useGreenhouses';
import { fetchUsers } from '../api';
import { API_BASE_URL, slides } from '../landingData';

const useLandingState = ({ userId }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { greenhouses = [] } = useGreenhouses(userId);
  // Deduplicamos por nombre para el selector visual
  const uniqueGreenhouses = Array.from(new Map(greenhouses.map(inv => [inv.nombre, inv])).values());
  
  // Estados compartidos pasados como props
  const [selectedLandingInvId, setSelectedLandingInvId] = useState(null);
  const [, setUsuario] = useState([]); // Para la lista de usuarios en la landing
  const [currentView, setCurrentView] = useState('home'); // 'home', 'temporada', 'cultivo', 'invernadero'
  const [selectedSeason, setSelectedSeason] = useState("Primavera");
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showGeneralSteps, setShowGeneralSteps] = useState(false);
  const [selectedManualStepIndex, setSelectedManualStepIndex] = useState(null);
  
  // Estados de Invernadero (Movidos aquí para evitar que se borren con el slider)
  const [activeSector, setActiveSector] = useState(1);
  const [sectorAssignments, setSectorAssignments] = useState({});
  const [sectorCount, setSectorCount] = useState(3);
  const [showCropPicker, setShowCropPicker] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSoilModalOpen, setIsSoilModalOpen] = useState(false);
  const [lockedStatus, setLockedStatus] = useState({});

  // Estados de Actuadores y Telemetría del Sector
  const [sectorActuators, setSectorActuators] = useState({});
  const [, setActuatorLoading] = useState(null);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);

  // Estados para Ecos del Huerto
  const [relatoForm, setRelatoForm] = useState({ nombre: '', mensaje: '', foto: '' });
  const [relatos, setRelatos] = useState([]);
  const [relatoIndex] = useState(0);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const profilePic = (userId && localStorage.getItem(`user_profile_pic_${userId}`)) || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff';
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Ayudantes de Lógica

  const getUsers = async () => {
    try {
      const data = await fetchUsers();
      if (Array.isArray(data)) setUsuario(data);
    } catch (error) {
      console.error("Error al obtener usuarios para la landing:", error);
    }
  };

  const loadRelatos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/relatos`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) setRelatos(data);
    } catch (e) { console.error(e); }
  };

  const updateSectorCountAndSave = (newCount) => {
    const count = Math.min(4, Math.max(1, Math.trunc(Number(newCount)) || 1));
    setSectorCount(count);
    setActiveSector(previous => Math.min(previous, count));
    if (selectedLandingInvId) {
      localStorage.setItem(`gh_sector_count_${selectedLandingInvId}`, count.toString());
    }
  };

  const updateSectorAssignmentsAndSave = (newAssignments) => {
    setSectorAssignments(newAssignments);
    if (selectedLandingInvId) {
      localStorage.setItem(`gh_sectors_${selectedLandingInvId}`, JSON.stringify(newAssignments));
    }
  };

  const handleDeleteSector = (idToDelete) => {
    const newAssignments = {};
    let nextId = 1;
    for (let i = 1; i <= sectorCount; i++) {
      if (i !== idToDelete) {
        if (sectorAssignments[i]) newAssignments[nextId] = sectorAssignments[i];
        nextId++;
      }
    }
    const newCount = Math.max(1, sectorCount - 1);
    updateSectorAssignmentsAndSave(newAssignments);
    updateSectorCountAndSave(newCount);
    
    if (activeSector === idToDelete) setActiveSector(1);
    else if (activeSector > idToDelete) setActiveSector(prev => Math.max(1, prev - 1));
  };

  const toggleActuator = (sectorId, key) => {
    const loadingKey = `${sectorId}_${key}`;
    setActuatorLoading(loadingKey);
    
    setTimeout(() => {
      setSectorActuators(prev => {
        const sectorData = prev[sectorId] || { riego: false, ventilacion: false, iluminacion: "Apagado", co2: false };
        let newVal;
        if (key === 'iluminacion') {
          const cycles = ["Apagado", "Vegetativo (Azul)", "Floración (Rojo)", "Full Spectrum"];
          const currentIdx = cycles.indexOf(sectorData[key]);
          newVal = cycles[(currentIdx + 1) % cycles.length];
        } else {
          newVal = !sectorData[key];
        }
        
        const updated = {
          ...prev,
          [sectorId]: {
            ...sectorData,
            [key]: newVal
          }
        };
        
        if (selectedLandingInvId) {
          localStorage.setItem(`gh_actuators_${selectedLandingInvId}`, JSON.stringify(updated));
        }
        return updated;
      });
      setActuatorLoading(null);
    }, 300);
  };

  // EFECTOS
  useEffect(() => {
    getUsers();
    loadRelatos();
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    setSelectedCrop(null);
    setShowGeneralSteps(false);
    setSelectedManualStepIndex(null);
    setIsProfileOpen(false);
    if (currentView !== 'invernadero') setSelectedLandingInvId(null);
  }, [currentView]);

  useEffect(() => {
    if (!selectedLandingInvId && uniqueGreenhouses.length > 0 && currentView === 'invernadero') {
      setSelectedLandingInvId(uniqueGreenhouses[0].id_invernadero);
    }
  }, [uniqueGreenhouses, selectedLandingInvId, currentView]);

  useEffect(() => {
    if (selectedLandingInvId) {
      const localCount = localStorage.getItem(`gh_sector_count_${selectedLandingInvId}`);
      const localAssignments = localStorage.getItem(`gh_sectors_${selectedLandingInvId}`);
      const localActuators = localStorage.getItem(`gh_actuators_${selectedLandingInvId}`);
      
      const inv = uniqueGreenhouses.find(g => Number(g.id_invernadero) === Number(selectedLandingInvId));
      const plants = getPlants(inv?.descripcion);
      
      if (localCount !== null && localAssignments !== null) {
        const count = Math.min(4, Math.max(1, parseInt(localCount) || 3));
        setSectorCount(count);
        localStorage.setItem(`gh_sector_count_${selectedLandingInvId}`, String(count));
        setSectorAssignments(JSON.parse(localAssignments));
      } else {
        const initial = {};
        plants.slice(0, 4).forEach((p, i) => { initial[i + 1] = p; });
        setSectorAssignments(initial);
        setSectorCount(Math.min(4, Math.max(3, plants.length)));
        localStorage.setItem(`gh_sector_count_${selectedLandingInvId}`, Math.min(4, Math.max(3, plants.length)).toString());
        localStorage.setItem(`gh_sectors_${selectedLandingInvId}`, JSON.stringify(initial));
      }

      if (localActuators !== null) {
        setSectorActuators(JSON.parse(localActuators));
      } else {
        setSectorActuators({});
      }

      setActiveSector(1);
    }
  }, [selectedLandingInvId, uniqueGreenhouses.length]);

  useEffect(() => {
    const fetchAllSoilStatus = async () => {
      const statuses = {};
      for (const inv of uniqueGreenhouses) {
        try {
          const res = await fetch(`${API_BASE_URL}/invernaderos/${inv.id_invernadero}/analisis-suelo`);
          const data = await res.json();
          statuses[inv.id_invernadero] = !data || data.detail;
        } catch (e) { console.error(e); }
      }
      setLockedStatus(statuses);
    };
    if (uniqueGreenhouses.length > 0 && currentView === 'invernadero') fetchAllSoilStatus();
  }, [uniqueGreenhouses.length, currentView]);

  // RENDERIZADO DE VISTAS
  // --- Datos para el Home expandido ---

  const [activeShowcaseCrop, setActiveShowcaseCrop] = useState(0);

  return {
    toggleActuator,
    setCurrentView,
    currentView,
    setIsProfileOpen,
    isProfileOpen,
    profilePic,
    setShowProfileModal,
    setShowConfigModal,
    selectedCrop,
    selectedSeason,
    setSelectedCrop,
    currentSlide,
    setSelectedSeason,
    selectedManualStepIndex,
    setSelectedManualStepIndex,
    showGeneralSteps,
    setShowGeneralSteps,
    uniqueGreenhouses,
    getPlants,
    selectedLandingInvId,
    lockedStatus,
    setIsSoilModalOpen,
    sectorCount,
    sectorAssignments,
    getIconForPlant,
    activeSector,
    sectorActuators,
    setSelectedLandingInvId,
    setActiveSector,
    handleDeleteSector,
    updateSectorCountAndSave,
    setShowCropPicker,
    showCropPicker,
    updateSectorAssignmentsAndSave,
    setIsTelemetryModalOpen,
    isTelemetryModalOpen,
    setCurrentSlide,
    homeStats,
    homeFeatures,
    homeSteps,
    activeShowcaseCrop,
    showcaseCrops,
    setActiveShowcaseCrop,
    relatoForm,
    setRelatoForm,
    setFileInputKey,
    loadRelatos,
    fileInputKey,
    relatoIndex,
    relatos,
    isSoilModalOpen,
    showProfileModal,
    showConfigModal,
    isDarkMode,
    setIsDarkMode
  };
};

export default useLandingState;
