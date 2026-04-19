import { useState, useEffect } from 'react';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [modalMode, setModalMode] = useState('login'); // 'login' o 'register'
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [usuario, setUsuario] = useState([]);
  const [profilePic, setProfilePic] = useState("https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff");
  const [expandedModules, setExpandedModules] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(1);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeModule, setActiveModule] = useState('home');
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    celular: '',
    password: '',
    confirmPassword: ''
  });
  
  // Estado para Gestión de Componentes
  const [components, setComponents] = useState([
    { id: 'COM-01', name: 'Riego Central', type: 'Bomba de Agua', greenhouse: 'Invernadero A', status: 'Activo', icon: '💧' },
    { id: 'COM-02', name: 'Iluminación Zona 1', type: 'Luz LED', greenhouse: 'Sección B', status: 'Mantenimiento', icon: '💡' },
    { id: 'COM-03', name: 'Sensor Humedad', type: 'Sensor de Humedad Suelo', greenhouse: 'Invernadero A', status: 'Activo', icon: '🌡️' },
  ]);
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compModalMode, setCompModalMode] = useState('add'); // 'add' o 'edit'
  const [selectedCompId, setSelectedCompId] = useState(null);
  const [compFormData, setCompFormData] = useState({ name: '', type: 'Bomba de Agua', greenhouse: 'Invernadero A', active: true });
  const [greenhouseImage, setGreenhouseImage] = useState(() => {
    return localStorage.getItem('greenhouseImage') || null;
  });
  
  // Estado local para manejar el estado de los usuarios (activo/inactivo)
  const [userStatuses, setUserStatuses] = useState(() => {
    return JSON.parse(localStorage.getItem('userStatuses')) || {};
  });


  // Datos de la ruleta educativa
  const API_BASE_URL = 'http://127.0.0.1:8000';

  const slides = [
    { id: 1, title: "Suelos Saludables", text: "La base de una gran cosecha comienza bajo tus pies.", img: `${API_BASE_URL}/static/IMG/cultivo1.jpg` },
    { id: 2, title: "Riego de Precisión", text: "Optimiza cada gota para un campo más verde.", img: `${API_BASE_URL}/static/IMG/cultivo2.jpeg` },
    { id: 3, title: "Control Orgánico", text: "Protege tus cultivos respetando el ecosistema.", img: `${API_BASE_URL}/static/IMG/cultivo3.jpg` },
    { id: 4, title: "Cosecha Eficiente", text: "Tecnología aplicada para maximizar el rendimiento.", img: `${API_BASE_URL}/static/IMG/cultivo4.jpg` }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const openModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
    setStatus({ message: '', type: '' });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      nombres: '',
      apellidos: '',
      correo: '',
      celular: '',
      password: '',
      confirmPassword: ''
    });
  };

  // Mock de datos para dispositivos
  const dispositivosData = [
    { 
      id: 1, name: 'ESP32 - Sensor Suelo A1', status: 'Online', 
      actividad: [40, 70, 45, 90, 65, 80, 30], 
      consumo: [20, 50, 30, 70, 40, 60, 25],
      productividad: { ef: 75, in: 15, mt: 10 }
    },
    { 
      id: 2, name: 'Cámara Térmica - Norte', status: 'Online', 
      actividad: [20, 30, 50, 40, 80, 20, 45], 
      consumo: [10, 20, 15, 30, 25, 35, 10],
      productividad: { ef: 60, in: 30, mt: 10 }
    },
    { 
      id: 3, name: 'Nodo Riego - Hidroponía', status: 'Offline', 
      actividad: [0, 0, 0, 0, 0, 0, 0], 
      consumo: [0, 0, 0, 0, 0, 0, 0],
      productividad: { ef: 0, in: 100, mt: 0 }
    }
  ];

  const currentDevice = dispositivosData.find(d => d.id === selectedDeviceId) || dispositivosData[0];

  const closeModal = () => setIsModalOpen(false);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const toggleModule = (moduleName) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleUserActive = (userId) => {
    const newStatuses = { ...userStatuses, [userId]: !userStatuses[userId] };
    setUserStatuses(newStatuses);
    localStorage.setItem('userStatuses', JSON.stringify(newStatuses));
  };

  const handleGreenhousePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGreenhouseImage(reader.result);
        localStorage.setItem('greenhouseImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Funciones CRUD Componentes
  const openCompModal = (mode, component = null) => {
    setCompModalMode(mode);
    if (mode === 'edit' && component) {
      setSelectedCompId(component.id);
      setCompFormData({ name: component.name, type: component.type, greenhouse: component.greenhouse, active: component.status === 'Activo' });
    } else {
      setCompFormData({ name: '', type: 'Bomba de Agua', greenhouse: 'Invernadero A', active: true });
    }
    setIsCompModalOpen(true);
  };

  const saveComponent = () => {
    if (compModalMode === 'add') {
      const newComp = {
        id: `COM-0${components.length + 1}`,
        name: compFormData.name,
        type: compFormData.type,
        greenhouse: compFormData.greenhouse,
        status: compFormData.active ? 'Activo' : 'Falla',
        icon: compFormData.type === 'Bomba de Agua' ? '💧' : compFormData.type === 'Luz LED' ? '💡' : '📡'
      };
      setComponents([...components, newComp]);
    } else {
      setComponents(components.map(c => c.id === selectedCompId ? { 
        ...c, 
        name: compFormData.name, 
        type: compFormData.type, 
        greenhouse: compFormData.greenhouse, 
        status: compFormData.active ? 'Activo' : 'Mantenimiento' 
      } : c));
    }
    setIsCompModalOpen(false);
  };

  const fetchUsuario = async () => {
    try {
      console.log("Intentando obtener información de usuario...");
      const response = await fetch(`${API_BASE_URL}/usuario`);
      const data = await response.json();
      console.log("Datos recibidos:", data);
      if (response.ok) {
        setUsuario(data);
      }
    } catch (error) {
      console.error("Error al obtener usuario:", error);
    }
  };

  useEffect(() => {
    fetchUsuario();

    // Temporizador para la rotación automática (5 segundos)
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpiar el error del campo actual mientras el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });
    setErrors({});

    const newErrors = {};

    // Validaciones de Correo (Tanto para Login como para Registro)
    if (!formData.correo.trim()) {
      newErrors.correo = "El correo es obligatorio.";
    } else if (!formData.correo.includes('@')) {
      newErrors.correo = "El correo debe incluir el carácter '@'.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "Formato de correo no válido (ej: usuario@gmail.com).";
    }

    // Validación de Contraseña (Básica para ambos)
    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es obligatoria.";
    }

    if (modalMode === 'register') {
      // Validaciones exclusivas de Registro
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      const vowelRegex = /[aeiouAEIOUáéíóúÁÉÍÓÚ]/;
      const consecutiveConsonantsRegex = /[^aeiouAEIOUáéíóúÁÉÍÓÚ\s\d]{5,}/;
      const repeatedCharsRegex = /(.)\1{2,}/;

      if (!formData.nombres.trim()) {
        newErrors.nombres = "El nombre es obligatorio.";
      } else if (formData.nombres.length > 30) {
        newErrors.nombres = "No puede superar los 30 caracteres.";
      } else if (/\d/.test(formData.nombres)) {
        newErrors.nombres = "No se permiten números.";
      } else if (repeatedCharsRegex.test(formData.nombres.toLowerCase())) {
        newErrors.nombres = "No se permiten tantas letras repetidas.";
      } else if (consecutiveConsonantsRegex.test(formData.nombres)) {
        newErrors.nombres = "Nombre inválido (palabra irreconocible).";
      } else if (!nameRegex.test(formData.nombres)) {
        newErrors.nombres = "Solo se permiten letras y espacios.";
      } else if (!vowelRegex.test(formData.nombres)) {
        newErrors.nombres = "Nombre inválido (faltan vocales).";
      }

      if (!formData.apellidos.trim()) {
        newErrors.apellidos = "El apellido es obligatorio.";
      } else if (formData.apellidos.length > 35) {
        newErrors.apellidos = "No puede superar los 35 caracteres.";
      } else if (/\d/.test(formData.apellidos)) {
        newErrors.apellidos = "No se permiten números.";
      } else if (repeatedCharsRegex.test(formData.apellidos.toLowerCase())) {
        newErrors.apellidos = "No se permiten tantas letras repetidas.";
      } else if (consecutiveConsonantsRegex.test(formData.apellidos)) {
        newErrors.apellidos = "Apellido inválido (palabra irreconocible).";
      } else if (!nameRegex.test(formData.apellidos)) {
        newErrors.apellidos = "Solo se permiten letras y espacios.";
      } else if (!vowelRegex.test(formData.apellidos)) {
        newErrors.apellidos = "Apellido inválido (faltan vocales).";
      }

      const celularRegex = /^[67]\d{6,7}$/;
      if (!formData.celular.trim()) {
        newErrors.celular = "El celular es obligatorio.";
      } else if (!celularRegex.test(formData.celular)) {
        newErrors.celular = "Debe tener entre 7 y 8 dígitos y empezar con 6 o 7.";
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,20}$/;
      if (formData.password.trim() && !passwordRegex.test(formData.password)) {
        newErrors.password = "Debe tener 10-20 caracteres, 1 mayúscula, 1 minúscula y 1 número.";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus({ message: "Datos incorrectos. Por favor, revisa los motivos en cada campo resaltado.", type: "error" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const dataToSubmit = modalMode === 'login' 
        ? { correo: formData.correo, password: formData.password }
        : registerData;
      
      // Creamos un controlador para abortar la petición si tarda demasiado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Aumentado a 15 segundos

      const endpoint = modalMode === 'login' ? '/login' : '/registro';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (e) {
        result = { detail: "El servidor devolvió una respuesta inesperada (Error 500)" };
      }
      
      if (response.ok) {
        const successMsg = modalMode === 'login' ? "Sesión iniciada" : "Usuario registrado con éxito";
        setStatus({ message: successMsg, type: "success" });
        
        if (modalMode === 'login') {
          setIsLoggedIn(true);
          setUserRole(result.rol || 'user');
          if (result.rol === 'admin') setIsDashboardVisible(true);
        }
        
        setFormData({ nombres: '', apellidos: '', correo: '', celular: '', password: '', confirmPassword: '' });
        fetchUsuario(); // Actualizamos la lista automáticamente
        
        setTimeout(() => {
          closeModal();
          setStatus({ message: '', type: '' });
        }, 2000);
      } else {
        let errorDetail = result.detail || "Error desconocido";
        if (Array.isArray(result.detail)) {
          const serverErrors = {};
          result.detail.forEach(err => {
            const field = err.loc[err.loc.length - 1];
            serverErrors[field] = err.msg;
          });
          setErrors(serverErrors);
          errorDetail = "Error de validación en el servidor.";
        }
        setStatus({ message: "Error: " + errorDetail, type: "error" });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setStatus({ message: "El servidor tarda demasiado en responder.", type: "error" });
      } else {
        console.error("Error en el registro:", error);
        setStatus({ message: "No se pudo conectar con el servidor.", type: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para renderizar el contenido principal (Landing Page)
  // Se usa tanto en la vista pública como en el Home del Dashboard Admin
  const renderLandingPage = () => (
    <div className="space-y-12">
      <main className="relative h-[500px] overflow-hidden rounded-3xl shadow-2xl">
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center bg-cover bg-center ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${slide.img})` }}
          >
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
              <p className="text-xl md:text-2xl opacity-90">{slide.text}</p>
            </div>
          </div>
        ))}
      </main>

      <section className="max-w-6xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Usuario</h2>
          <button className="px-4 py-2 bg-[#207b25] text-white rounded-md hover:bg-[#031c06] transition-colors shadow-sm" onClick={fetchUsuario}>Actualizar datos</button>
        </div>
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#99d578]/10 border-b border-gray-200">
              <tr className="text-gray-600 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Apellido</th>
                <th className="px-6 py-4 font-semibold">Correo</th>
                <th className="px-6 py-4 font-semibold">Celular</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuario.map(item => (
                <tr key={item.id_usuario} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700">{item.nombres}</td>
                  <td className="px-6 py-4 text-gray-700">{item.apellidos}</td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{item.correo}</td>
                  <td className="px-6 py-4 text-gray-700">{item.celular}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-6xl mx-auto py-20 px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">Nuestra misión</h2>
          <p className="text-gray-600 leading-relaxed">
            Nos dedicamos a transformar entornos urbanos y rurales a través de la implementación de sistemas de cultivo inteligentes. Creemos que cada espacio, sin importar su tamaño, tiene el potencial de convertirse en un oasis productivo.
          </p>
        </div>
        <div>
          <img src="/static/IMG/cultivo2.jpeg" alt="Invernadero" className="w-full h-64 object-cover rounded-3xl shadow-md" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="bg-[#99d578]/20 rounded-3xl p-10 md:p-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center shadow-inner border border-[#99d578]/30">
          <div>
            <div className="text-5xl font-bold text-[#207b25] mb-2">10</div>
            <div className="text-gray-600 font-medium">años en el mercado</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-[#207b25] mb-2">500</div>
            <div className="text-gray-600 font-medium">proyectos realizados</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-[#207b25] mb-2">99%</div>
            <div className="text-gray-600 font-medium">clientes satisfechos</div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 mb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">4 razones de seguridad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {["Calidad", "Velocidad", "Variedad", "Accesibilidad"].map((text, i) => (
            <div key={i} className="bg-[#99d578]/10 p-8 border-l-4 border-[#71cc49]">
              <h3 className="text-xl font-bold text-[#207b25] mb-2">{text}</h3>
              <p className="text-gray-600 text-sm">Implementación profesional y eficiente para tus cultivos.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 mb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Cosechas de temporada</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { nombre: "Tomate Cherry", desc: "Ideal para huertos urbanos y ensaladas frescas.", img: "cultivo1.jpg" },
            { nombre: "Lechuga Romana", desc: "Crecimiento rápido y textura crujiente todo el año.", img: "cultivo2.jpeg" },
            { nombre: "Zanahoria Orgánica", desc: "Raíces dulces y nutritivas de tu propio suelo.", img: "cultivo3.jpg" },
            { nombre: "Espinaca Baby", desc: "Perfecta para climas frescos y cosechas continuas.", img: "cultivo4.jpg" },
            { nombre: "Pimiento Rojo", desc: "Aporta color y vitamina C a tus platos favoritos.", img: "cultivo1.jpg" },
            { nombre: "Brócoli Fresco", desc: "Súper alimento lleno de nutrientes y fibra.", img: "cultivo2.jpeg" },
            { nombre: "Pepino", desc: "Refrescante e ideal para hidratarse en verano.", img: "cultivo3.jpg" },
            { nombre: "Rábano", desc: "Crecimiento ultra rápido en solo 30 días.", img: "cultivo4.jpg" }
          ].map((planta, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="h-48 overflow-hidden">
                <img 
                  src={`${API_BASE_URL}/static/IMG/${planta.img}`} 
                  alt={planta.nombre}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <div className="p-4 pb-1">
                <h3 className="text-lg font-bold text-[#207b25]">{planta.nombre}</h3>
              </div>
              <div className="p-4 pt-0">
                <p className="text-gray-600 text-xs">{planta.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 mb-20 bg-[#FDFBF3] rounded-3xl border border-gray-100">
        <h2 className="text-4xl font-bold text-[#207b25] text-center uppercase tracking-widest mb-12">
          Pasos de Cultivo
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative group px-4">
            <div className="rounded-3xl overflow-hidden shadow-lg bg-[#99d578]/20">
              <img 
                src={`${API_BASE_URL}/static/IMG/cultivo4.jpg`} 
                alt="Agricultor" 
                className="w-full h-80 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Metodología de Cultivo</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Optimizar el crecimiento de tus plantas requiere precisión y cuidado. Detallamos los pasos esenciales para garantizar cosechas sanas.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-50">
                <img src={`${API_BASE_URL}/static/IMG/cultivo1.jpg`} className="h-24 w-full object-cover rounded-lg mb-4" alt="Raspberry" />
                <h4 className="font-bold text-gray-800 mb-2 text-sm">Raspberry</h4>
                <ul className="text-[10px] text-gray-500 space-y-1">
                  <li>1. Suelo ácido.</li>
                  <li>2. Espalderas.</li>
                  <li>3. Riego.</li>
                </ul>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-50">
                <img src={`${API_BASE_URL}/static/IMG/cultivo2.jpeg`} className="h-24 w-full object-cover rounded-lg mb-4" alt="Aloe Vera" />
                <h4 className="font-bold text-gray-800 mb-2 text-sm">Aloe Vera</h4>
                <ul className="text-[10px] text-gray-500 space-y-1">
                  <li>1. Suelo arenoso.</li>
                  <li>2. Sol directo.</li>
                  <li>3. Poco riego.</li>
                </ul>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-50">
                <img src={`${API_BASE_URL}/static/IMG/cultivo3.jpg`} className="h-24 w-full object-cover rounded-lg mb-4" alt="Tomato" />
                <h4 className="font-bold text-gray-800 mb-2 text-sm">Tomato</h4>
                <ul className="text-[10px] text-gray-500 space-y-1">
                  <li>1. Abonado.</li>
                  <li>2. Entutorado.</li>
                  <li>3. Control plagas.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // LÓGICA DEL DASHBOARD PARA ADMINISTRADOR
  if (isLoggedIn && userRole === 'admin' && isDashboardVisible) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        {/* SIDEBAR IZQUIERDO */}
        <aside className={`${isSidebarOpen ? 'w-72' : 'w-12'} transition-all duration-300 bg-[#031c06] text-white flex flex-col shadow-2xl max-h-screen sticky top-0 overflow-hidden`}>
          {/* BOTÓN DE CONTROL DENTRO DEL SIDEBAR */}
          <div className={`flex ${isSidebarOpen ? 'justify-end pr-4' : 'justify-center'} p-2 sticky top-0 bg-[#031c06] z-20`}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#043b05] rounded-lg transition-colors text-[#71cc49] focus:outline-none"
              title={isSidebarOpen ? "Contraer menú" : "Expandir menú"}
            >
              <svg className={`w-6 h-6 transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className={`${isSidebarOpen ? 'opacity-100' : 'opacity-0 invisible'} transition-opacity duration-300 flex flex-col flex-grow overflow-y-auto`}>
          <div className="p-6 text-center border-b border-[#043b05]">
            <div 
              className="relative group w-24 h-24 mx-auto bg-white rounded-full mb-3 flex items-center justify-center overflow-hidden border-4 border-[#71cc49] cursor-pointer"
              onClick={() => document.getElementById('photoInput').click()}
            >
              <img src={profilePic} alt="User" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold">CAMBIAR</span>
              </div>
            </div>
            <input type="file" id="photoInput" hidden accept="image/*" onChange={handlePhotoChange} />
            <p className="font-bold text-base uppercase tracking-widest">{formData.correo || 'Administrador'}</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="w-2 h-2 bg-[#71cc49] rounded-full animate-pulse"></span>
              <span className="text-[10px] text-green-300 font-medium uppercase">En línea</span>
            </div>
          </div>

          <nav className="flex-grow p-4 space-y-6">
            {/* BOTÓN HOME */}
            <button 
              onClick={() => setIsDashboardVisible(false)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-lg ${activeModule === 'home' ? 'bg-white text-[#031c06] shadow-lg' : 'hover:bg-[#043b05]'}`}
            >
              <span>🏠</span> HOME (App principal)
            </button>

            {/* SECCIONES DEL MENÚ */}
            <div className="space-y-4">
              {/* MODULO GENERAL */}
              <div>
                <button 
                  onClick={() => toggleModule('general')}
                  className="w-full flex justify-between items-center px-3 py-2 text-sm font-black text-[#71cc49] uppercase tracking-wider hover:bg-[#043b05]/50 rounded-lg"
                >
                  Módulo General
                  <span className="text-xs">{expandedModules['general'] ? '▲' : '▼'}</span>
                </button>
                {expandedModules['general'] && (
                  <ul className="mt-2 space-y-1 text-base text-green-100">
                    <li 
                      className={`p-2 rounded-lg cursor-pointer flex gap-2 ${activeModule === 'estado_invernaderos' ? 'bg-[#207b25] font-bold' : 'hover:bg-[#043b05]'}`}
                      onClick={() => setActiveModule('estado_invernaderos')}
                    ><span>📊</span> Estado Invernaderos</li>
                    <li 
                      className={`p-2 rounded-lg cursor-pointer flex gap-2 ${activeModule === 'dispositivos_activos' ? 'bg-[#207b25] font-bold' : 'hover:bg-[#043b05]'}`}
                      onClick={() => setActiveModule('dispositivos_activos')}
                    ><span>🔌</span> Dispositivos Activos</li>
                    <li 
                      className={`p-2 rounded-lg cursor-pointer flex gap-2 ${activeModule === 'alertas_recientes' ? 'bg-[#207b25] font-bold' : 'hover:bg-[#043b05]'}`}
                      onClick={() => setActiveModule('alertas_recientes')}
                    ><span>🔔</span> Alertas Recientes</li>
                  </ul>
                )}
              </div>

              {/* MONITOREO AMBIENTAL */}
              <div>
                <button 
                  onClick={() => toggleModule('monitoreo')}
                  className="w-full flex justify-between items-center px-3 py-2 text-sm font-black text-[#71cc49] uppercase tracking-wider hover:bg-[#043b05]/50 rounded-lg"
                >
                  Monitoreo Ambiental
                  <span className="text-xs">{expandedModules['monitoreo'] ? '▲' : '▼'}</span>
                </button>
                {expandedModules['monitoreo'] && (
                  <ul className="mt-2 space-y-1 text-base text-green-100">
                    <li 
                      className={`p-2 rounded-lg cursor-pointer flex gap-2 ${activeModule === 'monitoreo_general' ? 'bg-[#207b25] font-bold' : 'hover:bg-[#043b05]'}`}
                      onClick={() => setActiveModule('monitoreo_general')}
                    ><span>🌡️</span> Monitoreo General</li>
                  </ul>
                )}
              </div>

              {/* GESTIÓN INVERNADEROS */}
              <div>
                <button 
                  onClick={() => toggleModule('invernaderos')}
                  className="w-full flex justify-between items-center px-3 py-2 text-sm font-black text-[#71cc49] uppercase tracking-wider hover:bg-[#043b05]/50 rounded-lg"
                >
                  Gestión Invernaderos
                  <span className="text-xs">{expandedModules['invernaderos'] ? '▲' : '▼'}</span>
                </button>
                {expandedModules['invernaderos'] && (
                  <ul className="mt-2 space-y-1 text-base text-green-100">
                    <li 
                      className={`p-2 rounded-lg cursor-pointer flex gap-2 ${activeModule === 'gestion_central_invernaderos' ? 'bg-[#207b25] font-bold' : 'hover:bg-[#043b05]'}`}
                      onClick={() => setActiveModule('gestion_central_invernaderos')}
                    >
                      <span>🏠</span> Gestión Central de Invernaderos
                    </li>
                  </ul>
                )}
              </div>

              {/* DETECCIÓN PLAGAS */}
              <div>
                <button 
                  onClick={() => toggleModule('plagas')}
                  className="w-full flex justify-between items-center px-3 py-2 text-sm font-black text-[#71cc49] uppercase tracking-wider hover:bg-[#043b05]/50 rounded-lg"
                >
                  Detección de Plagas
                  <span className="text-xs">{expandedModules['plagas'] ? '▲' : '▼'}</span>
                </button>
                {expandedModules['plagas'] && (
                  <ul className="mt-2 space-y-1 text-base text-green-100">
                    <li
                      className={`p-2 rounded-lg cursor-pointer flex gap-2 ${activeModule === 'gestor_riesgos' ? 'bg-[#207b25] font-bold' : 'hover:bg-[#043b05]'}`}
                      onClick={() => setActiveModule('gestor_riesgos')}
                    >
                      <span>🛡️</span> Gestor de Riesgos
                    </li>
                  </ul>
                )}
              </div>

              {/* GESTIÓN USUARIOS */}
              <div>
                <button 
                  onClick={() => toggleModule('usuarios_gest')}
                  className="w-full flex justify-between items-center px-3 py-2 text-sm font-black text-[#71cc49] uppercase tracking-wider hover:bg-[#043b05]/50 rounded-lg"
                >
                  Gestión Usuarios
                  <span className="text-xs">{expandedModules['usuarios_gest'] ? '▲' : '▼'}</span>
                </button>
                {expandedModules['usuarios_gest'] && (
                  <ul className="mt-2 space-y-1 text-base text-green-100">
                    <li className={`p-2 rounded-lg cursor-pointer ${activeModule === 'usuario' ? 'bg-[#207b25] font-bold' : 'hover:bg-[#043b05]'}`} onClick={() => setActiveModule('usuario')}>
                      Lista de Usuarios
                    </li>
                  </ul>
                )}
              </div>
            </div>

            {/* CERRAR SESIÓN */}
            <button 
              onClick={() => { setIsLoggedIn(false); setUserRole('user'); }}
              className="w-full mt-8 p-3 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all font-bold text-xs uppercase"
            >
              Cerrar Sesión
            </button>
          </nav>
          </div>
        </aside>

        {/* ÁREA DE CONTENIDO DINÁMICO */}
        <main className="flex-grow p-10 overflow-y-auto">
          <header className="mb-10 flex items-center">
            <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter flex-grow">
              {activeModule.replace('_', ' ')}
            </h1>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-[10px] font-bold text-gray-500 uppercase">
              Sistema AgroIndustrial v1.0
            </div>
          </header>

          <div className="bg-white rounded-3xl shadow-xl p-8 min-h-[500px] border border-gray-100">
            {activeModule === 'home' && <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">Seleccione un módulo para gestionar</div>}
            {activeModule === 'estado_invernaderos' && (
              <div className="grid grid-cols-12 gap-6 animate-fadeIn">
                {/* PANEL IZQUIERDO (Sidebar de Datos) */}
                <div className="col-span-3 space-y-6">
                  <div className="bg-gray-50 p-5 rounded-3xl border border-gray-200">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Condiciones Actuales</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Aire', val: '22°C' },
                        { label: 'Humedad', val: '65%' },
                        { label: 'Suelo', val: '45%' },
                        { label: 'Luz', val: '1,200 lx' }
                      ].map((item, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-start justify-between min-h-[80px]">
                          <span className="text-[10px] uppercase text-gray-500 font-black tracking-tight">{item.label}</span>
                          <span className="text-2xl font-black text-gray-900 leading-none">{item.val}</span>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-5 py-4 bg-gray-900 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-black transition-all shadow-lg">
                      Ver Reporte Detallado
                    </button>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-3xl border border-gray-200">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest text-left">Consumo de Energía</h3>
                    <div className="flex justify-center items-baseline gap-1 mb-3">
                      <span className="text-3xl font-black text-[#031c06]">56.46</span>
                      <span className="text-xs font-bold text-[#207b25] uppercase">Kw</span>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                      <div className="h-full bg-[#207b25]" style={{ width: '65%' }}></div>
                      <div className="h-full bg-[#99d578]" style={{ width: '35%' }}></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-3xl border border-gray-200">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Alertas Críticas</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-orange-100/50 border-l-4 border-orange-500 rounded-r-xl">
                        <span className="text-lg">⚠️</span>
                        <span className="text-[10px] font-black text-orange-800 uppercase leading-none">Nodo 3 Temp Alta</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-red-100/50 border-l-4 border-red-500 rounded-r-xl">
                        <span className="text-lg">🚫</span>
                        <span className="text-[10px] font-black text-red-800 uppercase leading-none">Sensor Suelo Offline</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PANEL CENTRAL (Visualización Principal) */}
                <div className="col-span-6 flex flex-col">
                  <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-2xl relative h-full min-h-[500px]">
                    <img 
                      src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80" 
                      className="absolute inset-0 w-full h-full object-cover" 
                      alt="Invernadero"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#031c06]/90 via-transparent to-transparent flex flex-col justify-end p-10">
                      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[32px] text-white">
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Invernadero A1</h2>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-[#207b25] rounded-full text-[10px] font-black uppercase">En Producción</span>
                          <span className="text-lg font-medium uppercase tracking-tight">Lechuga - Tomate - Zanahoria</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase font-black opacity-60 tracking-widest">Estado</span>
                            <span className="text-xs font-bold uppercase text-green-400">Activo</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase font-black opacity-60 tracking-widest">Fecha</span>
                            <span className="text-xs font-bold">{new Date().toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase font-black opacity-60 tracking-widest">Lugar</span>
                            <span className="text-xs font-bold uppercase">Achocalla, La Paz</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PANEL DERECHO (Métricas y Energía) */}
                <div className="col-span-3 space-y-6">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 mb-8 tracking-widest text-center">Métricas de Crecimiento</h3>
                    <div className="grid grid-cols-1 gap-8">
                      {[
                        { label: 'CO₂', val: '420', unit: 'ppm', color: 'text-[#207b25]', perc: 70 },
                        { label: 'pH Suelo', val: '6.8', unit: 'ph', color: 'text-[#71cc49]', perc: 45 }
                      ].map((m, i) => (
                        <div key={i} className="relative flex flex-col items-center">
                          <svg className="w-32 h-20"><path d="M 10 70 A 40 40 0 0 1 118 70" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round"/><path d="M 10 70 A 40 40 0 0 1 118 70" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeDasharray="170" strokeDashoffset={170 * (1 - m.perc/100)} className={m.color}/></svg>
                          <div className="mt-[-25px] text-center">
                            <span className="text-xl font-black block">{m.val}</span>
                            <span className="text-[9px] font-black uppercase text-gray-400">{m.label} ({m.unit})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 flex-grow">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Generación / Hora</h3>
                      <div className="flex bg-gray-200 p-1 rounded-xl">
                        <button className="text-[8px] font-black uppercase px-3 py-1 bg-white rounded-lg shadow-sm">Alm</button>
                        <button className="text-[8px] font-black uppercase px-3 py-1 text-gray-500">Eng</button>
                      </div>
                    </div>
                    <div className="flex items-end justify-between h-48 px-2">
                      {[30, 50, 45, 80, 60, 95, 70, 100, 85, 40, 55, 75].map((h, i) => (
                        <div key={i} className="w-2 bg-[#207b25] rounded-full transition-all hover:bg-[#71cc49]" style={{ height: `${h}%`, opacity: h/100 + 0.1 }}></div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[8px] font-black text-gray-400 uppercase"><span>00h</span><span>12h</span><span>23h</span></div>
                  </div>
                </div>
              </div>
            )}
            {activeModule === 'gestion_central_invernaderos' && (
              <div className="space-y-8 animate-fadeIn">
                {/* FILA SUPERIOR: PANELES DE MONITOREO */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Tarjeta de Clima */}
                  <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Clima de Hoy</h3>
                    <div className="flex flex-col items-center">
                      <p className="text-sm font-bold text-gray-600 mb-2">Lunes, 10 Abr 2023</p>
                      <span className="text-6xl font-black text-gray-900 mb-6 tracking-tighter">29°C</span>
                      
                      {/* Medidor de Temperatura Sala */}
                      <div className="relative w-32 h-20 mb-4">
                        <svg className="w-full h-full"><path d="M 10 70 A 40 40 0 0 1 118 70" fill="none" stroke="#f3f4f6" strokeWidth="10" strokeLinecap="round"/><path d="M 10 70 A 40 40 0 0 1 118 70" fill="none" stroke="#fbbf24" strokeWidth="10" strokeLinecap="round" strokeDasharray="170" strokeDashoffset="42" /></svg>
                        <div className="absolute inset-x-0 bottom-0 text-center">
                          <p className="text-xl font-black">25°C</p>
                          <p className="text-[8px] font-bold uppercase text-gray-400">Temp. Sala</p>
                        </div>
                      </div>

                      <div className="flex justify-between w-full px-4 border-t border-gray-50 pt-4">
                        <div className="text-center"><span className="block text-sm">🌬️</span><span className="text-[10px] font-bold">12 km/h</span></div>
                        <div className="text-center"><span className="block text-sm">💧</span><span className="text-[10px] font-bold">65%</span></div>
                        <div className="text-center"><span className="block text-sm">⏲️</span><span className="text-[10px] font-bold">1013 hPa</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta de Actividad de Plantas */}
                  <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Actividad de Crecimiento</h3>
                      <select className="text-[10px] font-bold bg-gray-50 border-none rounded-lg px-2 py-1">
                        <option>Semanal</option>
                      </select>
                    </div>
                    <div className="relative h-40 w-full mt-4">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                        <path d="M 0 35 Q 25 30, 50 20 T 100 5" fill="none" stroke="#10b981" strokeWidth="2" />
                        <circle cx="10" cy="33" r="1.5" fill="#10b981" />
                        <circle cx="50" cy="20" r="1.5" fill="#10b981" />
                        <circle cx="90" cy="8" r="1.5" fill="#10b981" />
                        <text x="52" y="15" fontSize="3" fontWeight="bold" fill="#10b981">3.8 cm</text>
                      </svg>
                      <div className="flex justify-between mt-4 text-[8px] font-black uppercase text-gray-400">
                        <div className="flex flex-col items-center"><span>🌱</span><span>Fase Semilla</span></div>
                        <div className="flex flex-col items-center"><span>🌿</span><span>Veg.</span></div>
                        <div className="flex flex-col items-center"><span>🌳</span><span>Fase Final</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta de Imagen de Contexto */}
                  <div 
                    className="bg-[#99d578]/20 rounded-[32px] overflow-hidden relative group cursor-pointer border-2 border-transparent hover:border-[#207b25] transition-all min-h-[200px]"
                    onClick={() => document.getElementById('greenhousePhotoInput').click()}
                  >
                    <input type="file" id="greenhousePhotoInput" hidden accept="image/*" onChange={handleGreenhousePhotoChange} />
                    <div className="p-6 relative z-10">
                      <h3 className="text-xs font-black uppercase text-[#043b05] tracking-widest bg-white/40 backdrop-blur-md inline-block px-2 py-1 rounded-lg">Vista del Invernadero</h3>
                    </div>
                    
                    <div className="absolute inset-0 w-full h-full">
                      {greenhouseImage ? (
                        <img src={greenhouseImage} alt="Vista Invernadero" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="absolute bottom-0 w-full">
                          {/* Simulación de la ilustración estilizada (Placeholder) */}
                          <div className="relative h-48 bg-gradient-to-t from-[#207b25] to-transparent">
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-8xl opacity-80">👨‍🌾</div>
                            <div className="absolute bottom-0 left-4 text-6xl opacity-30">🏠</div>
                            <div className="absolute bottom-0 right-4 text-4xl opacity-50">🥦🥦</div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Overlay al pasar el mouse */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <div className="bg-white/90 text-[#031c06] px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                        Click para cambiar imagen
                      </div>
                    </div>
                  </div>
                </div>

                {/* FILA INFERIOR: MÓDULO DE GESTIÓN CENTRALIZADO */}
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden">
                  <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Gestión de Componentes Electrónicos</h2>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">Mantenedor Central de Hardware</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="p-2 text-gray-400 hover:text-[#207b25] transition-colors">⚙️</button>
                      <button className="p-2 text-gray-400 hover:text-[#207b25] transition-colors">↗️</button>
                      <button 
                        onClick={() => openCompModal('add')}
                        className="ml-4 px-6 py-3 bg-[#207b25] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#031c06] transition-all shadow-lg flex items-center gap-2"
                      >
                        <span className="text-base">+</span> Añadir Nuevo Componente
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <table className="w-full">
                      <thead>
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                          <th className="px-6 py-4 text-left">ID / Icono</th>
                          <th className="px-6 py-4 text-left">Nombre Personalizado</th>
                          <th className="px-6 py-4 text-left">Tipo de Dispositivo</th>
                          <th className="px-6 py-4 text-left">Invernadero</th>
                          <th className="px-6 py-4 text-left">Estado</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {components.map((comp) => (
                          <tr key={comp.id} className="group hover:bg-gray-50/50 transition-all">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                                  {comp.icon}
                                </div>
                                <span className="text-[10px] font-black text-gray-300">{comp.id}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 font-black text-gray-800 text-sm tracking-tight">{comp.name}</td>
                            <td className="px-6 py-5 text-xs font-bold text-gray-500">{comp.type}</td>
                            <td className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-tighter">{comp.greenhouse}</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                comp.status === 'Activo' ? 'bg-[#99d578]/20 text-[#207b25]' : 
                                comp.status === 'Mantenimiento' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {comp.status}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => openCompModal('edit', comp)} className="p-2 bg-gray-100 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all">✏️</button>
                                <button onClick={() => setComponents(components.filter(c => c.id !== comp.id))} className="p-2 bg-gray-100 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all">🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>Mostrando 1-{components.length} de {components.length} componentes</span>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">‹</button>
                      <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">›</button>
                    </div>
                  </div>
                </div>

                {/* MODAL PARA REGISTRO/EDICIÓN */}
                {isCompModalOpen && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-white">
                      <div className="p-8 bg-[#031c06] text-white">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">
                          {compModalMode === 'add' ? 'Registrar Componente' : 'Editar Componente'}
                        </h2>
                        <p className="text-[10px] font-bold text-[#71cc49] uppercase mt-1">Configuración técnica de hardware</p>
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nombre del Componente</label>
                          <input 
                            type="text" value={compFormData.name}
                            onChange={(e) => setCompFormData({...compFormData, name: e.target.value})}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-[20px] text-sm font-bold focus:ring-2 focus:ring-[#71cc49] transition-all"
                            placeholder="Ej. Riego Central"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tipo de Dispositivo</label>
                            <select 
                              value={compFormData.type}
                              onChange={(e) => setCompFormData({...compFormData, type: e.target.value})}
                              className="w-full px-5 py-4 bg-gray-50 border-none rounded-[20px] text-sm font-bold"
                            >
                              {['Bomba de Agua', 'Luz LED', 'Sensor de Temperatura', 'Ventilador'].map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Invernadero Destino</label>
                            <select 
                              value={compFormData.greenhouse}
                              onChange={(e) => setCompFormData({...compFormData, greenhouse: e.target.value})}
                              className="w-full px-5 py-4 bg-gray-50 border-none rounded-[20px] text-sm font-bold"
                            >
                              {['Invernadero A', 'Sección B', 'Sector Hidropónico'].map(h => <option key={h}>{h}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[20px]">
                          <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Estado de Activación</span>
                          <button 
                            onClick={() => setCompFormData({...compFormData, active: !compFormData.active})}
                            className={`w-12 h-6 rounded-full transition-colors relative ${compFormData.active ? 'bg-[#207b25]' : 'bg-gray-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${compFormData.active ? 'right-1' : 'left-1'}`}></div>
                          </button>
                        </div>
                        <div className="flex gap-4 pt-4">
                          <button onClick={saveComponent} className="flex-grow py-4 bg-[#031c06] text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl">Guardar Cambios</button>
                          <button onClick={() => setIsCompModalOpen(false)} className="px-8 py-4 bg-gray-100 text-gray-500 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeModule === 'dispositivos_activos' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-12 gap-6">
                  {/* 1. LISTA DE DISPOSITIVOS (Vertical) */}
                  <div className="col-span-3 bg-gray-50 rounded-3xl border border-gray-200 p-6">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest text-center border-b pb-2">Dispositivos</h3>
                    <div className="space-y-3">
                      {dispositivosData.map(device => (
                        <div 
                          key={device.id}
                          onClick={() => setSelectedDeviceId(device.id)}
                          className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedDeviceId === device.id ? 'bg-white border-[#207b25] shadow-md scale-105' : 'bg-transparent border-transparent hover:bg-gray-100'}`}
                        >
                          <p className="text-xs font-bold text-gray-800 mb-1 leading-tight">{device.name}</p>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${device.status === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                            <span className="text-[9px] font-black uppercase text-gray-500">{device.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CONTENEDORES DE DATOS DINÁMICOS */}
                  <div className="col-span-9 grid grid-cols-2 gap-6">
                    {/* 2. ACTIVIDAD (Barras) */}
                    <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6">
                      <h3 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest">Actividad de Uso (24h)</h3>
                      <div className="flex items-end justify-between h-32 px-4">
                        {currentDevice.actividad.map((val, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 w-full">
                            <div className="w-4 bg-[#207b25] rounded-t-sm transition-all duration-500" style={{ height: `${val}%` }}></div>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">{i * 4}h</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. TOTAL DE CONSUMO (Líneas) */}
                    <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6">
                      <h3 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest">Total de Consumo</h3>
                      <div className="relative h-32 w-full">
                        <svg className="w-full h-full overflow-visible">
                          <polyline
                            fill="none"
                            stroke="#71cc49"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={currentDevice.consumo.map((v, i) => `${(i * 100) / 6},${100 - v}`).join(' ')}
                            className="transition-all duration-700"
                            style={{ vectorEffect: 'non-scaling-stroke' }}
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-end justify-between text-[8px] font-bold text-gray-400 uppercase pt-2">
                          <span>Min</span><span>Prom</span><span>Max</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. PRODUCTIVIDAD (Torta) */}
                    <div className="col-span-2 bg-gray-50 rounded-3xl border border-gray-200 p-6 flex flex-col items-center">
                      <h3 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest w-full">Productividad del Sistema</h3>
                      <div className="flex items-center gap-12">
                        <div className="relative w-32 h-32">
                          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                            <circle 
                              cx="18" cy="18" r="16" fill="none" stroke="#207b25" strokeWidth="4" 
                              strokeDasharray={`${currentDevice.productividad.ef}, 100`} 
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-gray-800">{currentDevice.productividad.ef}%</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase">Eficacia</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><span className="w-3 h-3 bg-[#207b25] rounded-full"></span> Eficiencia Operativa</div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><span className="w-3 h-3 bg-gray-300 rounded-full"></span> Tiempo de Inactividad</div>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><span className="w-3 h-3 bg-orange-400 rounded-full"></span> Mantenimiento</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeModule === 'alertas_recientes' && (
              <div className="space-y-8 animate-fadeIn font-sans">
                {/* Cabecera del Apartado (Header) */}
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Estado del Ecosistema</span>
                    <h2 className="text-4xl font-black text-[#1A1A1A] tracking-tighter">Control de Alertas</h2>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2 hover:border-gray-400 transition-all shadow-sm">
                      Zona de Cultivo
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2 hover:border-gray-400 transition-all shadow-sm">
                      Severidad
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                </div>

                {/* Data Table Container */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Sensor / Actuador</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Lectura Actual</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Margen de error</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Ubicación / Cama</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Favoritos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { id: 'SENSOR-01', name: 'Humedad Suelo', val: '18%', dev: '-5%', status: 'danger', place: 'Cama A - Sector Norte', icon: '💧' },
                        { id: 'SENSOR-02', name: 'Temperatura Aire', val: '32°C', dev: '+2%', status: 'safe', place: 'Cama B - Invernadero A1', icon: '🌡️' },
                        { id: 'SENSOR-03', name: 'Nivel CO₂', val: '450 ppm', dev: '+12%', status: 'danger', place: 'Sector Hidroponía', icon: '☁️' },
                        { id: 'ACT-04', name: 'Extractor 01', val: 'Activo', dev: 'Estable', status: 'safe', place: 'Zona de Secado', icon: '🌀' }
                      ].map((alert, idx) => (
                        <tr key={idx} className="group hover:bg-gray-50/80 transition-all duration-300">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-[#1A1A1A] rounded-[18px] flex items-center justify-center text-xl shadow-xl shadow-black/10 group-hover:scale-110 transition-transform duration-500">
                                {alert.icon}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-base font-black text-[#1A1A1A] leading-tight tracking-tight">{alert.name}</span>
                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{alert.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className="text-xl font-black text-[#1A1A1A] tracking-tighter">{alert.val}</span>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${alert.status === 'safe' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
                              <span className={`text-sm font-black tracking-tight ${alert.status === 'safe' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {alert.dev}
                              </span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className="text-sm font-bold text-gray-500">{alert.place}</span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 shadow-sm">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeModule === 'alertas_temperatura' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Monitor Termométrico</h2>
                  <span className="px-4 py-2 bg-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse">2 Alertas Activas</span>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Gráfica de Tendencia */}
                  <div className="col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Fluctuación de Temperatura (Últimas 6h)</h3>
                    <div className="relative h-48 w-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                        <path d="M 0 30 Q 20 10, 40 25 T 80 5 T 100 20" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 0 30 Q 20 10, 40 25 T 80 5 T 100 20 V 40 H 0 Z" fill="url(#gradTemp)" opacity="0.1" />
                        <defs>
                          <linearGradient id="gradTemp" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="transparent" /></linearGradient>
                        </defs>
                        {[0, 25, 50, 75, 100].map(x => <circle key={x} cx={x} cy={x === 80 ? 5 : (x === 40 ? 25 : 20)} r="1.5" fill="#ef4444" />)}
                      </svg>
                    </div>
                    <div className="flex justify-between mt-6 text-[10px] font-black text-gray-300 uppercase">
                      <span>10:00 AM</span><span>12:00 PM</span><span>02:00 PM</span><span>04:00 PM</span>
                    </div>
                  </div>

                  {/* Stats Rápidos */}
                  <div className="space-y-6">
                    <div className="bg-red-600 text-white p-6 rounded-[32px] shadow-lg shadow-red-200">
                      <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Pico Máximo</p>
                      <p className="text-4xl font-black mt-1">34.5°C</p>
                      <p className="text-[10px] font-bold mt-2 uppercase">Detectado en Sector A1</p>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Promedio Sala</p>
                      <p className="text-4xl font-black text-gray-900 mt-1">26.2°C</p>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-orange-500 w-[75%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Log de Alertas */}
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Historial de Incidencias Térmicas</h4>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {[
                      { time: '14:32', msg: 'Sobrecalentamiento Crítico', zone: 'Sector Norte', severity: 'High', temp: '34°C' },
                      { time: '12:15', msg: 'Descenso Brusco Detectado', zone: 'Hidroponía', severity: 'Mid', temp: '18°C' },
                      { time: '09:05', msg: 'Falla de Sensor Ambiente', zone: 'Zona Carga', severity: 'Low', temp: '--' }
                    ].map((log, i) => (
                      <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-gray-300">{log.time}</span>
                          <div className={`w-2 h-2 rounded-full ${log.severity === 'High' ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                          <span className="text-sm font-bold text-gray-800">{log.msg}</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">{log.zone}</span>
                        <span className="text-lg font-black text-red-600">{log.temp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeModule === 'alertas_plagas' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Amenazas Biológicas</h2>
                    <p className="text-[10px] font-bold text-[#207b25] uppercase tracking-[0.3em] mt-1">Escaneo de Bioseguridad en Tiempo Real</p>
                  </div>
                  <div className="bg-[#99d578]/10 px-6 py-3 rounded-2xl border border-[#99d578]/30">
                    <p className="text-[10px] font-black text-[#207b25] uppercase">Índice de Salud</p>
                    <p className="text-2xl font-black text-[#207b25]">92%</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  {/* Radar de Detección */}
                  <div className="col-span-2 bg-gray-900 rounded-[40px] p-8 relative overflow-hidden h-64">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[#207b25] rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-[#71cc49] rounded-full"></div>
                      <div className="absolute top-0 left-1/2 w-px h-full bg-[#71cc49]/30"></div>
                      <div className="absolute top-1/2 left-0 w-full h-px bg-[#71cc49]/30"></div>
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <h3 className="text-[10px] font-black text-[#71cc49] uppercase tracking-widest">Radar de proximidad CAM-04</h3>
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                        <span className="text-white font-black text-lg">Posible Foco de Infección: Sector B</span>
                      </div>
                      <button className="self-start px-4 py-2 bg-[#207b25] text-white rounded-xl text-[8px] font-black uppercase tracking-widest">Activar Protocolo</button>
                    </div>
                  </div>

                  {/* Distribución de Especies */}
                  <div className="col-span-2 bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Detecciones por Especie</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Araña Roja', count: 12, color: 'bg-red-500' },
                        { name: 'Mosca Blanca', count: 5, color: 'bg-orange-400' },
                        { name: 'Pulgones', count: 2, color: 'bg-yellow-400' }
                      ].map((p, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                            <span className="text-gray-600">{p.name}</span>
                            <span className="text-gray-900">{p.count} avistamientos</span>
                          </div>
                          <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                            <div className={`h-full ${p.color}`} style={{ width: `${(p.count/20)*100}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Alertas Visuales Recientes */}
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { id: 'AL-99', type: 'Araña Roja', conf: '98%', time: '10 min ago', status: 'CRITICAL', zone: 'Sector B' },
                    { id: 'AL-85', type: 'Déficit Nitrógeno', conf: '85%', time: '1h ago', status: 'WARNING', zone: 'Sector A1' },
                    { id: 'AL-72', type: 'Hongo Foliar', conf: '72%', time: '3h ago', status: 'OBSERVATION', zone: 'Sector C' }
                  ].map((a, i) => (
                    <div key={i} className={`p-6 rounded-[32px] border-l-[12px] shadow-sm flex flex-col justify-between min-h-[160px] ${
                      a.status === 'CRITICAL' ? 'bg-red-50 border-red-600' : 
                      a.status === 'WARNING' ? 'bg-orange-50 border-orange-500' : 'bg-blue-50 border-blue-500'
                    }`}>
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black opacity-40 uppercase tracking-widest">{a.id}</span>
                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${
                          a.status === 'CRITICAL' ? 'bg-red-200 text-red-700' : 'bg-orange-200 text-orange-700'
                        }`}>{a.status}</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-gray-900 leading-none">{a.type}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{a.zone} • {a.time}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                          <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                        </div>
                        <span className="text-[10px] font-black text-gray-900">{a.conf} CONF.</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeModule === 'gestor_riesgos' && (
              <div className="space-y-8 animate-fadeIn">
                {/* ESTADÍSTICAS DE VISIÓN ARTIFICIAL */}
                <div className="grid grid-cols-4 gap-6">
                  {[
                    { label: 'Total Imágenes', val: '1,284', sub: '+12 hoy', color: 'text-gray-900' },
                    { label: 'Detecciones Positivas', val: '42', sub: '8 críticas', color: 'text-red-600' },
                    { label: 'Precisión IA', val: '98.2%', sub: 'Modelo v2.4', color: 'text-[#207b25]' },
                    { label: 'Cámaras Activas', val: '12/12', sub: 'Sincronizado', color: 'text-blue-600' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">{stat.label}</p>
                      <p className={`text-3xl font-black ${stat.color}`}>{stat.val}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{stat.sub}</p>
                    </div>
                  ))}
                </div>

                {/* SECCIÓN DE CRISIS / ALERTAS RECIENTES */}
                <div className="bg-red-50 border border-red-100 rounded-[32px] p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white text-2xl animate-pulse">⚠️</div>
                    <div>
                      <h3 className="text-xl font-black text-red-900 uppercase tracking-tighter">Protocolo de Crisis Activo</h3>
                      <p className="text-sm font-bold text-red-700/70">Detección múltiple de Araña Roja en Sector B</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/60 p-4 rounded-2xl border border-red-200">
                      <p className="text-[9px] font-black text-red-800 uppercase mb-1">Severidad</p>
                      <div className="h-2 w-full bg-red-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 w-[85%]"></div>
                      </div>
                    </div>
                    <div className="bg-white/60 p-4 rounded-2xl border border-red-200 text-center">
                      <p className="text-[9px] font-black text-red-800 uppercase mb-1">Último Avistamiento</p>
                      <p className="text-sm font-black text-red-900">Hace 4 minutos</p>
                    </div>
                    <div className="bg-white/60 p-4 rounded-2xl border border-red-200 text-center">
                      <p className="text-[9px] font-black text-red-800 uppercase mb-1">Acción Requerida</p>
                      <p className="text-sm font-black text-red-900 uppercase">Nebulización Focal</p>
                    </div>
                  </div>
                </div>

                {/* GALERÍA DE CAPTURAS */}
                <div>
                  <div className="flex justify-between items-end mb-6">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Galería de Evidencias</h3>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Exportar Reporte</button>
                      <button className="px-4 py-2 bg-white border border-gray-200 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Filtrar por Fecha</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                    {[
                      { 
                        pest: 'Araña Roja', 
                        conf: '99%', 
                        time: '14:20', 
                        cam: 'CAM-04', 
                        img: 'https://images.unsplash.com/photo-1599403362157-123477f72205?auto=format&fit=crop&w=400&q=80',
                        status: 'Crítico'
                      },
                      { 
                        pest: 'Pulgón Verde', 
                        conf: '94%', 
                        time: '13:55', 
                        cam: 'CAM-01', 
                        img: 'https://images.unsplash.com/photo-1542315181-229202720d20?auto=format&fit=crop&w=400&q=80',
                        status: 'Alerta'
                      },
                      { 
                        pest: 'Mosca Blanca', 
                        conf: '88%', 
                        time: '12:10', 
                        cam: 'CAM-08', 
                        img: 'https://images.unsplash.com/photo-1522228115018-d838bcce5c3a?auto=format&fit=crop&w=400&q=80',
                        status: 'Analizado'
                      },
                      { 
                        pest: 'Trips', 
                        conf: '91%', 
                        time: '10:30', 
                        cam: 'CAM-02', 
                        img: 'https://images.unsplash.com/photo-1516205651411-aef33a44f7c2?auto=format&fit=crop&w=400&q=80',
                        status: 'Crítico'
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-md group hover:shadow-xl transition-all">
                        <div className="relative h-48">
                          <img src={item.img} alt={item.pest} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white ${item.status === 'Crítico' ? 'bg-red-600' : item.status === 'Alerta' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                            <p className="text-[10px] font-black text-white">{item.conf} Confianza</p>
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="text-base font-black text-gray-900 leading-tight mb-1">{item.pest}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.cam} • {item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeModule === 'monitoreo_general' && (
              <div className="flex flex-col gap-8 bg-[#F6F6F8] p-6 rounded-[30px] -m-8 min-h-full font-sans">
                {/* Cabecera con Interruptor de Unidades */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-[#031c06] uppercase tracking-tighter">Monitoreo General</h2>
                  <div className="flex gap-2 p-1 bg-white rounded-full shadow-sm border border-gray-100">
                    <button className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white font-bold text-xs flex items-center justify-center">°C</button>
                    <button className="w-10 h-10 rounded-full bg-transparent text-gray-400 font-bold text-xs flex items-center justify-center hover:bg-gray-50">°F</button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                  {/* Columna de Estado Actual (Izquierda) */}
                  <div className="col-span-4 space-y-8">
                    <div className="bg-white rounded-[30px] p-10 shadow-sm border border-gray-50 text-center flex flex-col items-center gap-6">
                      <div className="text-8xl drop-shadow-xl animate-bounce-slow">☀️</div>
                      <div className="space-y-2">
                        <h3 className="text-7xl font-black text-[#1A1A1A] tracking-tighter">24°C</h3>
                        <p className="text-lg font-bold text-[#1A1A1A]">Lunes, <span className="text-gray-400 font-medium">14:30 PM</span></p>
                      </div>
                      <div className="w-full h-px bg-gray-100 my-2"></div>
                      <div className="w-full space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                          <span className="text-xl text-amber-400">⛅</span>
                          <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Cielo Despejado</span>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                          <span className="text-xl text-blue-500">🚿</span>
                          <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Riego: Activo (15%)</span>
                        </div>
                      </div>
                      <div className="w-full mt-4 group cursor-pointer overflow-hidden rounded-[25px] shadow-lg border-4 border-white">
                        <img 
                          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80" 
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-700" 
                          alt="Sector A1 Map" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Panel de Análisis (Derecha) */}
                  <div className="col-span-8 space-y-10">
                    {/* Selector de Periodo */}
                    <div className="flex gap-10 border-b border-gray-200">
                      <button className="pb-4 text-xl font-black text-[#1A1A1A] border-b-4 border-[#1A1A1A] tracking-tighter">Hoy</button>
                      <button className="pb-4 text-xl font-bold text-gray-300 hover:text-gray-500 transition-colors tracking-tighter">Esta Semana</button>
                    </div>

                    {/* Fila de Pronóstico */}
                    <div className="flex justify-between gap-3 overflow-x-auto pb-4">
                      {['Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom', 'Lun'].map((day, i) => (
                        <div key={i} className="bg-white rounded-[25px] p-5 flex flex-col items-center gap-3 shadow-sm border border-white min-w-[90px] hover:shadow-md transition-shadow">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</span>
                          <span className="text-3xl">⛅</span>
                          <div className="flex flex-col items-center leading-none">
                            <span className="text-base font-black text-[#1A1A1A]">{24+i}°</span>
                            <span className="text-xs font-bold text-gray-300 mt-1">{18+i}°</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cuadrícula de Métricas Críticas */}
                    <div className="grid grid-cols-3 gap-6">
                      {/* Índice de Calor */}
                      <div className="bg-white rounded-[30px] p-8 shadow-sm border border-white">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Índice Calor</h4>
                        <div className="flex flex-col items-center">
                          <svg className="w-32 h-20"><path d="M 10 70 A 40 40 0 0 1 118 70" fill="none" stroke="#F6F6F8" strokeWidth="10" strokeLinecap="round"/><path d="M 10 70 A 40 40 0 0 1 118 70" fill="none" stroke="#fbbf24" strokeWidth="10" strokeLinecap="round" strokeDasharray="170" strokeDashoffset={170 * (1 - 4/12)} /></svg>
                          <span className="text-4xl font-black text-[#1A1A1A] mt-[-25px]">4</span>
                        </div>
                      </div>

                      {/* Ventilación */}
                      <div className="bg-white rounded-[30px] p-8 shadow-sm border border-white">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Ventilación</h4>
                        <div className="space-y-4">
                          <div className="text-4xl font-black text-[#1A1A1A]">12 <span className="text-xs font-bold text-gray-300 uppercase">km/h</span></div>
                          <div className="flex items-center gap-3 text-sm font-black text-gray-700">
                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">🧭</div>
                            NNE
                          </div>
                        </div>
                      </div>

                      {/* Ciclo de Luz */}
                      <div className="bg-white rounded-[30px] p-8 shadow-sm border border-white">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Ciclo Luz</h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl text-amber-400 font-black leading-none">↑</span>
                            <div>
                              <p className="text-[8px] font-black text-gray-300 uppercase">Salida</p>
                              <p className="text-sm font-black text-gray-800 leading-none">06:45 AM</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-2xl text-orange-500 font-black leading-none">↓</span>
                            <div>
                              <p className="text-[8px] font-black text-gray-300 uppercase">Puesta</p>
                              <p className="text-sm font-black text-gray-800 leading-none">18:30 PM</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Humedad Relativa */}
                      <div className="bg-white rounded-[30px] p-8 shadow-sm border border-white flex justify-between">
                        <div className="flex flex-col justify-between">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Humedad</h4>
                          <div className="text-4xl font-black text-[#1A1A1A]">65%</div>
                          <span className="text-[10px] font-black text-emerald-500 uppercase">Confort: Normal</span>
                        </div>
                        <div className="w-3 h-full bg-gray-50 rounded-full overflow-hidden flex flex-col justify-end">
                          <div className="bg-blue-500 w-full rounded-full transition-all duration-1000" style={{ height: '65%' }}></div>
                        </div>
                      </div>

                      {/* Visibilidad/CO2 */}
                      <div className="bg-white rounded-[30px] p-8 shadow-sm border border-white">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Visibilidad/CO₂</h4>
                        <div className="text-4xl font-black text-[#1A1A1A]">420 <span className="text-[10px] font-bold text-gray-300">ppm</span></div>
                        <div className="mt-4 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full inline-block">Calidad Óptima</div>
                      </div>

                      {/* Calidad del Aire (AQI) */}
                      <div className="bg-white rounded-[30px] p-8 shadow-sm border border-white flex justify-between items-center">
                        <div className="flex flex-col">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">AQI</h4>
                          <span className="text-5xl font-black text-[#1A1A1A]">42</span>
                        </div>
                        <div className="w-2 h-full bg-gray-50 rounded-full relative">
                          <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-[#207b25] rounded-full border-2 border-white shadow-md animate-pulse" style={{ top: '42%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeModule === 'usuario' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Control de Accesos</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestión de personal y estados de cuenta</p>
                  </div>
                  <button 
                    className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#207b25] transition-all shadow-xl"
                    onClick={fetchUsuario}
                  >
                    🔄 Sincronizar Base de Datos
                  </button>
                </div>

                <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Identidad</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Contacto</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Asignar Rol</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estado de Cuenta</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {usuario.map(item => (
                        <tr key={item.id_usuario} className="group hover:bg-gray-50/50 transition-all duration-300">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#207b25] to-[#71cc49] rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:rotate-6 transition-transform">
                                {item.nombres[0]}{item.apellidos[0]}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-gray-800 leading-none">{item.nombres} {item.apellidos}</span>
                                <span className="text-[10px] font-bold text-[#207b25] mt-1">{item.correo}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">📱 {item.celular}</span>
                          </td>
                          <td className="px-8 py-5">
                            <select 
                              className="text-[10px] font-black uppercase bg-gray-100 border-none rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#71cc49] cursor-pointer"
                              defaultValue={item.correo.includes('admin') ? '1' : '3'}
                              onChange={(e) => console.log(`Cambiando rol de ${item.id_usuario} a ${e.target.value}`)}
                            >
                              <option value="1">💠 Admin (1)</option>
                              <option value="2">📝 Editor (2)</option>
                              <option value="3">👤 Usuario (3)</option>
                            </select>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex justify-center">
                              <button 
                                onClick={() => toggleUserActive(item.id_usuario)}
                                className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 focus:outline-none ${userStatuses[item.id_usuario] !== false ? 'bg-[#71cc49]' : 'bg-gray-300'}`}
                              >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${userStatuses[item.id_usuario] !== false ? 'translate-x-7' : 'translate-x-1'}`} />
                                <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase ${userStatuses[item.id_usuario] !== false ? 'text-[#207b25]' : 'text-gray-400'}`}>
                                  {userStatuses[item.id_usuario] !== false ? 'Activo' : 'Inactivo'}
                                </span>
                              </button>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <button className="p-2.5 bg-gray-100 text-gray-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">✏️</button>
                              <button className="p-2.5 bg-gray-100 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeModule === 'roles_permisos' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Matriz de Seguridad</h2>
                    <p className="text-[10px] font-bold text-[#207b25] uppercase tracking-[0.3em] mt-1">Configuración de niveles de autoridad</p>
                  </div>
                  <button className="px-6 py-3 bg-[#031c06] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                    + Definir Nuevo Rol
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  {[
                    { title: 'Súper Admin', color: 'border-red-500', desc: 'Acceso total a la infraestructura, bases de datos y finanzas.', perms: ['Full Access', 'HW Management', 'DB Root', 'User Control'], active: true },
                    { title: 'Operador Técnico', color: 'border-[#207b25]', desc: 'Gestión de sensores y actuadores. Sin acceso a usuarios.', perms: ['Dashboard', 'HW Control', 'Alerts Sync'], active: true },
                    { title: 'Analista Data', color: 'border-blue-500', desc: 'Solo lectura de estadísticas y reportes de producción.', perms: ['Read Stats', 'Export PDF', 'View Maps'], active: false }
                  ].map((rol, i) => (
                    <div key={i} className={`bg-white rounded-[48px] p-10 border-t-[12px] shadow-2xl transition-all hover:-translate-y-2 ${rol.color}`}>
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-2xl font-black text-gray-900 leading-tight uppercase">{rol.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${rol.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {rol.active ? 'Habilitado' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-400 mb-8 leading-relaxed">{rol.desc}</p>
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Privilegios de Sistema</p>
                        {rol.perms.map(p => (
                          <div key={p} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-[#71cc49] rounded-full shadow-[0_0_8px_#71cc49]"></div>
                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter">{p}</span>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-10 py-4 bg-gray-50 border border-gray-100 rounded-3xl text-[10px] font-black uppercase text-gray-400 hover:bg-gray-900 hover:text-white transition-all">
                        Configurar Permisos
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="flex items-center justify-between p-4 bg-[#207b25] text-white shadow-lg">
        <div className="flex items-center h-14">
          <img src={`${API_BASE_URL}/static/logoAgroIndustrial.png`} alt="AgroIndustrial" className="h-full w-auto object-contain" />
        </div>
        <div className="flex items-center gap-4">
          {!isLoggedIn && (
            <button 
              className="px-4 py-2 bg-white text-[#207b25] rounded-md font-medium hover:bg-[#99d578]/20 transition-colors shadow-sm"
              onClick={() => openModal('register')}
            >
              Registrarse
            </button>
          )}
          {isLoggedIn && userRole === 'admin' && (
            <button 
              className="px-4 py-2 bg-orange-500 text-white rounded-md font-bold hover:bg-orange-600 transition-colors shadow-sm"
              onClick={() => setIsDashboardVisible(true)}
            >
              Administrador
            </button>
          )}
          <div className="relative">
            <button 
              className="px-4 py-2 border border-white rounded-md hover:bg-[#043b05] transition-colors flex items-center gap-2"
              onClick={toggleDropdown}
            >
              Configuración
              <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-2 z-50 text-gray-800 border border-gray-100">
                {!isLoggedIn ? (
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-[#99d578]/20 hover:text-[#207b25] transition-colors" 
                    onClick={() => { openModal('login'); setIsDropdownOpen(false); }}
                  >
                    Inicio de sesión
                  </button>
                ) : (
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 transition-colors" 
                    onClick={() => { setIsLoggedIn(false); setIsDropdownOpen(false); }}
                  >
                    Cerrar sesión
                  </button>
                )}
                <button 
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-[#99d578]/20 hover:text-[#207b25] transition-colors" 
                  onClick={() => { setIsDropdownOpen(false); }}
                >
                  Perfil
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {renderLandingPage()}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{modalMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
            
            {status.message && (
              <div className={`mb-4 p-3 rounded-md text-sm font-medium ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {status.message}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {modalMode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-600">Nombre(s)</label>
                      <input className={`px-3 py-2 border rounded-md outline-none transition-all ${errors.nombres ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`} type="text" name="nombres" value={formData.nombres} onChange={handleChange} required placeholder="Juan" />
                      {errors.nombres && <span className="text-red-600 text-[10px] font-bold mt-1">{errors.nombres}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-600">Apellido(s)</label>
                      <input className={`px-3 py-2 border rounded-md outline-none transition-all ${errors.apellidos ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`} type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required placeholder="Pérez" />
                      {errors.apellidos && <span className="text-red-600 text-[10px] font-bold mt-1">{errors.apellidos}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-600">Celular</label>
                    <input className={`px-3 py-2 border rounded-md outline-none transition-all ${errors.celular ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`} type="tel" name="celular" value={formData.celular} onChange={handleChange} required placeholder="3001234567" />
                    {errors.celular && <span className="text-red-600 text-[10px] font-bold mt-1">{errors.celular}</span>}
                  </div>
                </>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">{modalMode === 'login' ? 'Gmail' : 'Correo Electrónico'}</label>
                <input className={`px-3 py-2 border rounded-md outline-none transition-all ${errors.correo ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`} type="email" name="correo" value={formData.correo} onChange={handleChange} required placeholder="usuario@gmail.com" />
                {errors.correo && <span className="text-red-600 text-[10px] font-bold mt-1">{errors.correo}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Contraseña</label>
                <div className="relative">
                  <input 
                    className={`w-full px-3 py-2 border rounded-md outline-none transition-all ${errors.password ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`}
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    )}
                  </button>
                </div>
                {errors.password && <span className="text-red-600 text-[10px] font-bold mt-1">{errors.password}</span>}
              </div>
              {modalMode === 'register' && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Confirmar contraseña</label>
                  <div className="relative">
                    <input 
                      className={`w-full px-3 py-2 border rounded-md outline-none transition-all ${errors.confirmPassword ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-[#207b25]'}`}
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirmPassword" 
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      required 
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="text-red-600 text-[10px] font-bold mt-1">{errors.confirmPassword}</span>}
                </div>
              )}
              <div className="flex flex-col gap-3 pt-4">
                <button type="submit" className="w-full py-3 bg-[#207b25] text-white rounded-lg font-bold hover:bg-[#031c06] transition-all disabled:opacity-50 shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Procesando...' : (modalMode === 'login' ? 'Iniciar Sesión' : 'Registrarse')}
                </button>
                <button type="button" className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors" onClick={closeModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-white py-8 text-center">
        <p>&copy; 2024 AgroIndustrial - Gestión Inteligente.</p>
      </footer>
    </div>
  );
}

export default App;
