import { useState, useEffect } from 'react';
import { useGreenhouses } from './useGreenhouses';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { fetchDashboardDevices } from './api';
import { API_BASE_URL, evidenciasRaw, resoluciones, pestImages, pestInfo } from './riskData';
import SoilAnalysisModal from './SoilAnalysisModal';

const GestorRiesgos = ({ userId, userNames }) => {
  const { greenhouses = [] } = useGreenhouses(userId);
  const [selectedInvId, setSelectedInvId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPestDetail, setSelectedPestDetail] = useState(null);
  const [allDevices, setAllDevices] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [lockedStatus, setLockedStatus] = useState({});
  const [isSoilModalOpen, setIsSoilModalOpen] = useState(false);

  const uniqueGreenhouses = Array.from(new Map(greenhouses.map(inv => [inv.nombre, inv])).values());

  useEffect(() => {
    if (!selectedInvId && uniqueGreenhouses.length > 0) {
      setSelectedInvId(uniqueGreenhouses[0].id_invernadero);
    }
  }, [uniqueGreenhouses, selectedInvId]);

  useEffect(() => {
    const loadAllDevices = async () => {
      try {
        const devicesData = await fetchDashboardDevices(null);
        setAllDevices(devicesData);
        setCameras(devicesData.filter(d => d.tipo === 'Cámara'));
      } catch (err) {
        console.error("Error al cargar dispositivos:", err);
      }
    };
    loadAllDevices();
  }, []);

  useEffect(() => {
    const fetchAllSoilStatus = async () => {
      const statuses = {};
      for (const inv of uniqueGreenhouses) {
        try {
          const res = await fetch(`${API_BASE_URL}/invernaderos/${inv.id_invernadero}/analisis-suelo`);
          const data = await res.json();
          statuses[inv.id_invernadero] = !data;
        } catch (e) { console.error(e); }
      }
      setLockedStatus(statuses);
    };
    if (uniqueGreenhouses.length > 0) fetchAllSoilStatus();
  }, [uniqueGreenhouses.length]);

  const currentInv = uniqueGreenhouses.find(g => Number(g.id_invernadero) === Number(selectedInvId));

  let baseEvidencias = evidenciasRaw.filter(e => {
    return !selectedInvId || (currentInv && e.greenhouseName === currentInv.nombre);
  });

  if (baseEvidencias.length === 0 && currentInv) {
    // Generar 5 evidencias por defecto para este invernadero
    const pests = ['Araña Roja', 'Pulgón Verde', 'Mosca Blanca', 'Trips', 'Araña Roja'];
    const statuses = ['Crítico', 'Alerta', 'Analizado', 'Alerta', 'Crítico'];
    const confs = ['99%', '94%', '88%', '91%', '96%'];
    baseEvidencias = pests.map((pest, idx) => ({
      pest,
      conf: confs[idx],
      time: `1${idx}:20`,
      date: new Date().toISOString().split('T')[0],
      cam: idx + 1,
      img: pestImages[pest] || `${API_BASE_URL}/static/evidencias/spider_red.jpg`,
      status: statuses[idx],
      greenhouseName: currentInv.nombre
    }));
  }

  const evidencias = baseEvidencias.filter(e => {
    return selectedDate ? e.date === selectedDate : true;
  });

  const filteredCameras = cameras.filter(c => !selectedInvId || Number(c.id_inv) === Number(selectedInvId));
  const activeCamerasCount = filteredCameras.filter(c => c.estado === 'Activo').length;

  const speciesStats = Object.entries(
    evidencias.reduce((acc, ev) => {
      acc[ev.pest] = (acc[ev.pest] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({
    name,
    count,
    color: name === 'Araña Roja' ? 'bg-red-500' : 
           name === 'Pulgón Verde' ? 'bg-orange-400' : 
           name === 'Mosca Blanca' ? 'bg-yellow-400' : 'bg-blue-400'
  }));

  const urgentEvidencia = 
    evidencias.find(e => e.status === 'Crítico') || 
    evidencias.find(e => e.status === 'Alerta') || 
    evidencias.find(e => e.status === 'Analizado');

  const handleExportPDF = () => {
    try {
      console.log("Iniciando exportación de PDF...");
      // Formato A4 apaisado para mejor distribución visual de tablas
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const greenhouseName = selectedInvId 
        ? (uniqueGreenhouses.find(g => g.id_invernadero === selectedInvId)?.nombre || 'Sector Seleccionado')
        : 'Todos los Invernaderos';

      // 1. BANDEJA DE CABECERA (Header)
      const primaryColor = [30, 64, 175]; // Blue 800 - Elegante y corporativo
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text('REPORTE DE BIOSEGURIDAD', 14, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Emitido por: ${userNames || 'Administrador'}  |  Fecha Emisión: ${new Date().toLocaleDateString()}`, pageWidth - 14, 22, { align: 'right' });
      doc.text(`Sector Analizado: ${greenhouseName}  |  Asunto: Estado de Riesgos Biológicos`, pageWidth - 14, 32, { align: 'right' });

      // 2. RESUMEN ESTADÍSTICO (Estadísticas Clave)
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text('RESUMEN EJECUTIVO', 14, 60);
      
      // Contadores
      const totalAlerts = evidencias.length;
      const criticalAlerts = evidencias.filter(e => e.status === 'Crítico').length;
      const uniqueSpecies = Array.from(new Set(evidencias.map(e => e.pest)));
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total de Incidencias: ${totalAlerts}`, 14, 70);
      doc.text(`Alertas Críticas: ${criticalAlerts}`, 70, 70);
      doc.text(`Especies Detectadas: ${uniqueSpecies.length} (${uniqueSpecies.join(', ')})`, 130, 70);

      if (selectedDate) {
        doc.text(`Filtro Aplicado: ${selectedDate}`, 14, 77);
      }

      // Línea divisoria
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 83, pageWidth - 14, 83);

      // 3. TABLA DE EVIDENCIAS DETALLADA
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text('DETALLE DE INCIDENCIAS BIOLÓGICAS', 14, 95);

      const tableColumn = ["Especie", "Cámara ID", "Ubicación Inferida", "Fecha y Hora", "Nivel de Confianza", "Estado de Severidad", "Recomendación Principal"];
      
      const tableRows = evidencias.map(ev => {
        // Buscar el nombre real de la cámara si lo tenemos
        const camObj = cameras.find(c => c.id === ev.cam);
        const camName = camObj ? camObj.name : `CAM-${ev.cam}`;
        
        // Obtener una recomendación corta
        const rec = resoluciones[ev.pest] ? resoluciones[ev.pest].split('.')[0] + '.' : 'Evaluar protocolo estándar.';
        
        return [
          ev.pest,
          camName,
          camObj ? (camObj.ubicacion || 'No def.') : 'Zona Activa',
          `${ev.date} ${ev.time}`,
          ev.conf,
          ev.status.toUpperCase(),
          rec
        ];
      });
  
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 100,
        theme: 'grid',
        headStyles: { 
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          textColor: [80, 80, 80],
          valign: 'middle'
        },
        alternateRowStyles: { 
          fillColor: [248, 250, 252] // Slate-50
        },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: [55, 65, 81] }, // Especie
          4: { halign: 'center' }, // Confianza
          5: { halign: 'center', fontStyle: 'bold' } // Estado
        },
        didParseCell: function (data) {
          // Colorear condicionalmente la celda de Estado
          if (data.section === 'body' && data.column.index === 5) {
            if (data.cell.raw === 'CRÍTICO') {
              data.cell.styles.textColor = [220, 38, 38]; // Red
            } else if (data.cell.raw === 'ALERTA') {
              data.cell.styles.textColor = [234, 88, 12]; // Orange
            } else {
              data.cell.styles.textColor = [37, 99, 235]; // Blue
            }
          }
        }
      });

      // 4. PROTOCOLOS E INSTRUCCIONES
      const finalY = doc.lastAutoTable.finalY || 100;
      
      if (finalY + 40 < pageHeight) {
        doc.setFontSize(12);
        doc.setTextColor(3, 28, 6);
        doc.setFont("helvetica", "bold");
        doc.text('NOTAS Y RECOMENDACIONES TÉCNICAS', 14, finalY + 20);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        const disclaimer = "Este reporte ha sido generado de forma automatizada mediante el motor de Inteligencia Artificial del sistema. Las recomendaciones presentadas deben ser validadas por el Departamento de Agronomía antes de realizar aplicaciones químicas en los cultivos. Se requiere registro del Análisis Químico de Suelo actualizado para mantener la precisión del algoritmo de IA.";
        
        const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 28);
        doc.text(splitDisclaimer, 14, finalY + 30);
      }

      // 5. PIE DE PÁGINA (Paginación)
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
        doc.text('Generado por Sistema Central de AgroGestión', 14, pageHeight - 10);
      }
  
      const fileName = `Bioseguridad_${greenhouseName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      console.log("PDF generado con éxito");
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un problema al generar el reporte. Revisa la consola para más detalles.");
    }
  };

  const PestDetailView = ({ pestName, onBack }) => {
    const info = pestInfo[pestName] || {};
    const pestEvidencias = evidencias.filter(e => e.pest === pestName);
    const worstStatus = pestEvidencias.some(e => e.status === 'Crítico') ? 'Crítico' : 
                        pestEvidencias.some(e => e.status === 'Alerta') ? 'Alerta' : 'Analizado';

    return (
      <div className="animate-fadeIn space-y-8 pb-20">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-800 hover:text-white transition-all shadow-sm active:scale-95 border border-emerald-100"
        >
          ← Volver al Panel de Riesgos
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
           <div className="rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-white h-[450px] relative group">
             <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-transparent transition-colors z-10"></div>
             <img src={pestImages[pestName] || `${API_BASE_URL}/api/asset/IMG/cultivo4`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={pestName} />
           </div>
           
           <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-6">
                  <h2 className="text-5xl lg:text-6xl font-black text-gray-800 tracking-tight uppercase italic leading-none">{pestName}</h2>
                  <span className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white shadow-lg ${worstStatus === 'Crítico' ? 'bg-red-500 animate-pulse' : worstStatus === 'Alerta' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                    Severidad: {worstStatus}
                  </span>
                </div>
                <p className="text-emerald-600 font-black uppercase text-[12px] tracking-[0.4em] bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 w-fit px-4 py-1.5 rounded-full">Protocolos de Resolución</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="p-8 bg-red-50/80 backdrop-blur-sm rounded-[2.5rem] border border-red-100 shadow-sm">
                    <h5 className="text-[14px] font-black uppercase text-red-800 tracking-widest mb-3 flex items-center gap-3">
                      <span className="w-8 h-8 bg-red-100/80 rounded-lg flex items-center justify-center text-lg shadow-sm">❓</span> Causas
                    </h5>
                    <p className="text-gray-700 font-medium leading-relaxed italic text-lg">"{info.causas}"</p>
                 </div>
                 <div className="p-8 bg-amber-50/80 backdrop-blur-sm rounded-[2.5rem] border border-amber-100 shadow-sm">
                    <h5 className="text-[14px] font-black uppercase text-amber-800 tracking-widest mb-3 flex items-center gap-3">
                      <span className="w-8 h-8 bg-amber-100/80 rounded-lg flex items-center justify-center text-lg shadow-sm">🍂</span> Síntomas Detectables
                    </h5>
                    <p className="text-gray-700 font-medium leading-relaxed text-lg">{info.sintomas}</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-12 bg-white/60 backdrop-blur-xl p-10 rounded-[40px] border border-gray-100 shadow-sm mt-8">
           <div className="space-y-6">
              <h5 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-4">
                <span className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center text-xl shadow-sm">⚡</span>
                Correcciones para evitar la plaga
              </h5>
              <p className="text-gray-700 text-2xl font-black leading-tight italic border-l-4 border-emerald-500 pl-8">
                {info.solucion}
              </p>
              <div className="pt-4 space-y-4">
                <p className="text-[11px] font-black uppercase text-emerald-400 tracking-[0.4em] opacity-80">Instrucciones de Aplicación Técnica</p>
                <ul className="text-sm font-bold text-gray-500 space-y-3">
                   <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Calibrar equipo de atomización para micro-gotas.</li>
                   <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Aplicar durante el ocaso para maximizar absorción.</li>
                   <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Repetir ciclo cada 7 días hasta erradicación total.</li>
                </ul>
              </div>
           </div>

           <div className="pt-8 border-t border-gray-100 space-y-8">
              <h5 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-4">
                <span className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center text-xl shadow-sm">🛡️</span>
                Estrategia Preventiva
              </h5>
              <div className="grid lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <p className="text-gray-600 text-lg font-medium leading-relaxed italic border-l-4 border-gray-200 pl-8">
                    {info.prevencion}
                  </p>
                  <div className="space-y-4">
                    <p className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.4em]">Protocolo de Erradicación Física y Química</p>
                    <ul className="text-sm font-bold text-gray-500 space-y-3">
                       <li className="flex items-center gap-3"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Eliminación manual y retiro de hojas o brotes dañados.</li>
                       <li className="flex items-center gap-3"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Aplicación de pesticidas específicos según el foco.</li>
                       <li className="flex items-center gap-3"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Desinfección de herramientas y limpieza de restos.</li>
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 h-fit">
                   <div className="p-8 bg-emerald-50/80 backdrop-blur-sm rounded-[2.5rem] border border-emerald-100 text-center shadow-sm">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Eficacia</p>
                      <p className="text-3xl font-black text-emerald-700 mt-2">92.5%</p>
                   </div>
                   <div className="p-8 bg-blue-50/80 backdrop-blur-sm rounded-[2.5rem] border border-blue-100 text-center shadow-sm">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Seguridad</p>
                      <p className="text-3xl font-black text-blue-700 mt-2">Grado A</p>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  if (selectedPestDetail) {
    return (
      <div className="p-10 min-h-screen">
        <PestDetailView 
          pestName={selectedPestDetail} 
          onBack={() => setSelectedPestDetail(null)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn font-sans min-h-[80vh]">
      
      {/* Cabecera */}
      <div className="space-y-1">
        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Sistema de Bioseguridad
        </span>
        <h2 className="text-3xl lg:text-4xl font-black text-gray-800 tracking-tight">Gestor de Riesgos</h2>
      </div>

      {/* Botones de Selección de Invernadero */}
      <div className="flex flex-wrap gap-4 p-2 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-100 w-fit shadow-sm">
        {uniqueGreenhouses.map((inv) => (
          <button
            key={inv.id_invernadero}
            onClick={() => setSelectedInvId(inv.id_invernadero)}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${Number(selectedInvId) === Number(inv.id_invernadero) ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
          >
            🌿 {inv.nombre}
            {lockedStatus[inv.id_invernadero] && (
              <span className="text-amber-400 animate-pulse drop-shadow-sm">🔒</span>
            )}
          </button>
        ))}
      </div>

      {selectedInvId && lockedStatus[selectedInvId] ? (
        <div className="bg-white/90 backdrop-blur-xl p-16 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 text-center space-y-6 flex flex-col items-center justify-center min-h-[50vh] relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-50 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-5xl shadow-sm border border-amber-100 animate-bounce">
            🔒
          </div>
          <h3 className="text-3xl font-black text-gray-800 tracking-tight">Análisis Requerido</h3>
          <p className="text-gray-500 font-medium max-w-md">Es imperativo registrar el análisis químico de suelo de <span className="font-bold text-gray-800">"{currentInv?.nombre}"</span> antes de acceder a la gestión biológica y algoritmos de prevención.</p>
          <button onClick={() => setIsSoilModalOpen(true)} className="px-8 py-3.5 mt-4 bg-gray-900 text-white rounded-xl font-black uppercase text-xs tracking-wider shadow-lg shadow-gray-900/20 hover:bg-black hover:scale-105 transition-all">
            Registrar Balance Químico
          </button>
        </div>
      ) : (
        <>
      {/* ESTADÍSTICAS DE VISIÓN ARTIFICIAL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Imágenes Analizadas', val: '1,284', sub: '+12 hoy', color: 'text-gray-800', bg: 'bg-white/90' },
          { label: 'Detecciones Positivas', val: '42', sub: '8 críticas', color: 'text-red-600', bg: 'bg-red-50/50 border-red-100' },
          { label: 'Precisión IA', val: '98.2%', sub: 'Modelo v2.4', color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100' },
          { label: 'Cámaras Activas', val: `${activeCamerasCount}/${filteredCameras.length}`, sub: selectedInvId ? 'Sector Local' : 'Sincronizado', color: 'text-blue-600', bg: 'bg-blue-50/50 border-blue-100' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg || 'bg-white/90 border-gray-100'} backdrop-blur-xl p-8 rounded-3xl border shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1`}>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">{stat.label}</p>
            <div>
              <p className={`text-4xl font-black tracking-tighter ${stat.color} drop-shadow-sm`}>{stat.val}</p>
              <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SECCIÓN DE CRISIS / ALERTAS RECIENTES */}
      {urgentEvidencia && (
      <div className="bg-red-50/90 backdrop-blur-xl border border-red-200 rounded-[32px] p-8 shadow-lg shadow-red-100/50 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-500/10 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-5 mb-8 relative z-10">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 text-2xl border border-red-200 shadow-sm animate-pulse">⚠️</div>
          <div>
            <h3 className="text-xl font-black text-red-900 tracking-tight">Protocolo de Crisis Activo</h3>
            <p className="text-xs font-bold text-red-700/80 uppercase tracking-wider mt-1">
              Detección de {urgentEvidencia.pest} en {currentInv?.nombre || urgentEvidencia.greenhouseName || 'el sector'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="bg-white/80 p-5 rounded-2xl border border-red-100 shadow-sm">
            <p className="text-[9px] font-black text-red-800 uppercase tracking-widest mb-2">Severidad</p>
            <div className="h-2.5 w-full bg-red-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${urgentEvidencia.status === 'Crítico' ? 'bg-red-500 w-[95%]' : 'bg-orange-400 w-[60%]'}`}></div>
            </div>
          </div>
          <div className="bg-white/80 p-5 rounded-2xl border border-red-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-red-800 uppercase tracking-widest mb-1">Último Avistamiento</p>
            <p className="text-sm font-black text-red-900">{urgentEvidencia.time} <span className="opacity-60">({urgentEvidencia.date})</span></p>
          </div>
          <div className="bg-white/80 p-5 rounded-2xl border border-red-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-red-800 uppercase tracking-widest mb-1">Acción Inmediata</p>
            <p className="text-sm font-black text-red-900 uppercase">
              {urgentEvidencia.status === 'Crítico' ? 'Nebulización Focal' : 'Monitoreo Manual'}
            </p>
          </div>
        </div>
      </div>
      )}

      {/* GALERÍA DE CAPTURAS */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Galería de Evidencias</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Imágenes procesadas por IA</p>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <button 
              onClick={handleExportPDF}
              className="px-5 py-2.5 bg-gray-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-black transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              📄 Exportar Reporte
            </button>
            <div className="flex flex-col space-y-1.5">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Filtrar Fecha</span>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-gray-50/50 border border-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                title="Filtrar por fecha"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {evidencias.length > 0 ? (
            evidencias.map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
              {(() => { const camera = cameras.find(c => c.id === item.cam); item.cameraName = camera ? camera.name : `CAM-${item.cam}`; })()}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img src={item.img} alt={item.pest} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest text-white shadow-sm backdrop-blur-md ${item.status === 'Crítico' ? 'bg-red-500/90 border border-red-400' : item.status === 'Alerta' ? 'bg-orange-500/90 border border-orange-400' : 'bg-blue-500/90 border border-blue-400'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2 py-1 rounded-md border border-white/30 text-white text-[9px] font-black tracking-widest">
                  {item.conf}
                </div>
                <div className="absolute bottom-4 left-4">
                   <h4 className="text-lg font-black text-white tracking-tight leading-none drop-shadow-md">{item.pest}</h4>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow bg-gray-50/30">
                <div className="mt-auto flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><span className="text-gray-400">📹</span> {item.cameraName}</span>
                  <span>{item.date} {item.time}</span>
                </div>
              </div>
            </div>
          ))
          ) : (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
              <span className="text-4xl mb-4 opacity-50">🍃</span>
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                No se encontraron evidencias biológicas en este sector
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DE RESPUESTA Y RESOLUCIÓN DE PLAGAS */}
      <div className="bg-emerald-50/50 backdrop-blur-xl rounded-[40px] p-8 lg:p-10 border border-emerald-100/50 mt-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
        <div className="flex items-center gap-5 mb-10 relative z-10">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl shadow-sm border border-emerald-200">📋</div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Protocolos de Resolución</h3>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Guía técnica para el control de amenazas detectadas</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          {Array.from(new Set(evidencias.map(e => e.pest))).map((pest, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-md rounded-[32px] overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full group hover:border-emerald-200 hover:shadow-md transition-all duration-300">
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img src={pestImages[pest] || `${API_BASE_URL}/api/asset/IMG/cultivo4`} alt={pest} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                <div className="absolute bottom-4 left-5 flex items-center gap-3">
                   <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(248,113,113,0.8)]"></span>
                   <h4 className="text-xl font-black text-white tracking-tight drop-shadow-sm">{pest}</h4>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow bg-gray-50/50">
                <p className="text-xs font-medium text-gray-600 leading-relaxed mb-6">
                  {resoluciones[pest] || 'Consultar con el departamento de agronomía para determinar el tratamiento químico u orgánico específico para este sector.'}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => setSelectedPestDetail(pest)}
                    className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 hover:text-emerald-800 transition-colors bg-emerald-50 px-4 py-2 rounded-xl"
                  >
                    Ver ficha técnica →
                  </button>
                </div>
              </div>
            </div>
          ))}
          {evidencias.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-16 bg-white/50 rounded-[32px] border border-dashed border-gray-200">
              <p className="opacity-40 font-black uppercase tracking-widest text-[10px]">
                No hay protocolos de resolución activos para este sector
              </p>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      <SoilAnalysisModal 
        isOpen={isSoilModalOpen}
        onClose={() => {
          setIsSoilModalOpen(false);
          fetch(`${API_BASE_URL}/invernaderos/${selectedInvId}/analisis-suelo`)
            .then(res => res.json())
            .then(data => setLockedStatus(prev => ({ ...prev, [selectedInvId]: !data })));
        }}
        greenhouseId={selectedInvId}
      />
    </div>
  );
};

export default GestorRiesgos;
