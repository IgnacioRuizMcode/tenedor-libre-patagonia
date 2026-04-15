import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import heroImg from "../assets/hero-meat.jpg";
import lambFire from "../assets/lamb-fire.jpg";
import { FaInstagram, FaArrowRight, FaMapMarkerAlt, FaPhoneAlt, FaRegClock, FaCheck } from "react-icons/fa";
import { FiMenu, FiX, FiArrowUpRight } from "react-icons/fi";
import { LayoutDashboard } from "lucide-react";

registerLocale('es', es);
axios.defaults.withCredentials = true;

const menuCategories = [
  { title: "Carnes", items: ["Jabalí Ahumado", "Cordero al Palo", "Lomo Vetado", "Pollo a las Brasas", "Costillar BBQ"] },
  { title: "Guarniciones", items: ["Mix de Ensaladas", "Papas Rústicas", "Arroz Primavera", "Salsas de la Casa"] },
  { title: "Barra Libre", items: ["Bebidas y Jugos", "Té y Café Premium", "Aguas Saborizadas"], badge: "+ 1 Copa de Vino" },
  { title: "Postres", items: ["Postres Caseros", "Frutas de Estación", "Leche Asada", "Mousse Chocolate"] },
];

const ADMIN_EMAIL = "ig.ruizm@duocuc.cl";

function LandingPage() {
  // --- ESTADOS LÓGICOS ---
  const [formData, setFormData] = useState({ 
    customerName: '', 
    email: '', 
    phone: '', 
    guestCount: 1, 
    date: '', 
    time: '' 
  });
  const [startDate, setStartDate] = useState(null); 
  const [mensaje, setMensaje] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authMensaje, setAuthMensaje] = useState('');
  const [user, setUser] = useState(null);
  
  // --- ESTADOS UI ---
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isAdmin = user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/current-user');
        console.log('Usuario actual:', res.data);
        if (res.data && res.data.email) {
          setUser(res.data);
          setFormData(prev => ({ 
            ...prev, 
            customerName: res.data.name || '', 
            email: res.data.email 
          }));
        } else {
          setUser(null);
          setFormData(prev => ({ 
            ...prev, 
            customerName: '', 
            email: '' 
          }));
        }
      } catch (error) { 
        console.log('Usuario no autenticado');
        setUser(null);
        setFormData(prev => ({ 
          ...prev, 
          customerName: '', 
          email: '' 
        }));
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/api/auth/logout');
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        guestCount: 1,
        date: '',
        time: ''
      });
      setStartDate(null);
      window.location.reload(); 
    } catch (error) { 
      console.error("Error al cerrar sesión"); 
    }
  };

  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 1 && day !== 2 && day !== 3; 
  };

  const obtenerHorasDisponibles = (fecha) => {
    if (!fecha) return [];
    const dia = fecha.getDay(); 
    const horasTarde = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];
    const horasNoche = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];
    if (dia === 4 || dia === 0) return horasTarde; 
    if (dia === 5 || dia === 6) return [...horasTarde, ...horasNoche]; 
    return []; 
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAuthChange = (e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value });

  const handleDateChange = (date) => {
    setStartDate(date);
    if (date) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      setFormData({ ...formData, date: `${yyyy}-${mm}-${dd}`, time: '' });
    } else {
      setFormData({ ...formData, date: '', time: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensaje('');
    
    if (!formData.customerName || !formData.email || !formData.phone || !formData.date || !formData.time) {
      setMensaje('❌ Por favor completa todos los campos del formulario');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await axios.post('http://localhost:5000/api/reservas', formData);
      setIsSubmitted(true);
      
      setMensaje('🔥 ¡Reserva creada exitosamente! Abriendo WhatsApp para confirmar...');
      
      const telRestaurante = "56951412968"; 
      const textoWA = `¡Hola! 🔥 Confirmo mi reserva en *Tenedor Libre Patagonia*:\n\n👤 *Nombre:* ${formData.customerName}\n📧 *Email:* ${formData.email}\n📅 *Fecha:* ${formData.date}\n🕒 *Hora:* ${formData.time} hrs\n👥 *Personas:* ${formData.guestCount}\n📞 *WhatsApp:* ${formData.phone}\n\n¡Nos vemos!`;
      
      setTimeout(() => { 
        window.open(`https://wa.me/${telRestaurante}?text=${encodeURIComponent(textoWA)}`, '_blank'); 
      }, 2000);
      
      setTimeout(() => {
        if (user) {
          setFormData({ 
            customerName: user.name || '', 
            email: user.email, 
            phone: '', 
            guestCount: 1, 
            date: '', 
            time: '' 
          });
        } else {
          setFormData({ 
            customerName: '', 
            email: '', 
            phone: '', 
            guestCount: 1, 
            date: '', 
            time: '' 
          });
        }
        setStartDate(null);
        setIsSubmitted(false);
        setTimeout(() => setMensaje(''), 1000);
      }, 4000);

    } catch (error) {
      console.error('Error al crear reserva:', error);
      setMensaje('❌ ' + (error.response?.data?.message || 'Error al crear la reserva. Intenta nuevamente.'));
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => window.location.href = 'http://localhost:5000/api/auth/google';

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthMensaje('');
    try {
      await axios.post(`http://localhost:5000/api/auth/${isRegistering ? 'register' : 'login'}`, authForm);
      window.location.reload(); 
    } catch (error) {
      setAuthMensaje('❌ ' + (error.response?.data?.message || 'Error de conexión'));
    }
  };

  // Función para scroll suave a la sección de reservas
  const scrollToReserva = () => {
    const reservaSection = document.getElementById('reserva');
    if (reservaSection) {
      reservaSection.scrollIntoView({ behavior: 'smooth' });
    }
    // Cerrar menú móvil si está abierto
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans scroll-smooth">
      
      {/* NAVBAR */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#050505]/95 backdrop-blur-md shadow-sm border-b border-white/10" : "bg-transparent"}`}>
        <nav className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center">
              <span className={`font-serif text-xl md:text-2xl tracking-tight transition-colors ${scrolled ? "text-white" : "text-white"}`}>
                Tenedor Libre
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              <a href="#inicio" className="text-sm text-white/70 hover:text-white transition-colors">Inicio</a>
              <a href="#buffet" className="text-sm text-white/70 hover:text-white transition-colors">Menú</a>
              <a href="#ubicacion" className="text-sm text-white/70 hover:text-white transition-colors">Ubicación</a>
              
              {/* NUEVO BOTÓN RESERVAR EN EL NAVBAR */}
              <button 
                onClick={scrollToReserva}
                className="text-sm px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 transition-colors rounded-md"
              >
                Reservar
              </button>
              
              {user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-white/20">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-medium text-white">{user.name?.split(' ')[0] || user.email?.split('@')[0]}</span>
                    <div className="flex gap-2 mt-1">
                      <Link to="/perfil" className="text-[10px] text-amber-200 hover:text-white transition-colors uppercase tracking-widest">Reservas</Link>
                      {isAdmin && (
                        <Link to="/admin" className="text-[10px] text-amber-200 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1">
                          <LayoutDashboard className="w-3 h-3" />
                          Admin
                        </Link>
                      )}
                      <button onClick={handleLogout} className="text-[10px] text-white/50 hover:text-white transition-colors uppercase tracking-widest">Salir</button>
                    </div>
                  </div>
                  {user.avatar && (
                    <img src={user.avatar} className="w-9 h-9 rounded-full object-cover border border-white/20" alt="Avatar" />
                  )}
                </div>
              ) : (
                <button onClick={() => setIsLoginModalOpen(true)} className={`text-sm px-5 py-2.5 transition-all ${scrolled ? "bg-white text-black hover:bg-white/90" : "bg-white text-black hover:bg-white/90"}`}>
                  Ingresar
                </button>
              )}
            </div>

            <button className="md:hidden p-2 text-white" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>

          {/* MOBILE MENU */}
          {isOpen && (
            <div className="md:hidden py-6 flex flex-col gap-6 bg-[#050505] border-t border-white/10">
              <a href="#inicio" onClick={() => setIsOpen(false)} className="text-sm text-white/70 hover:text-white">Inicio</a>
              <a href="#buffet" onClick={() => setIsOpen(false)} className="text-sm text-white/70 hover:text-white">Menú</a>
              <a href="#ubicacion" onClick={() => setIsOpen(false)} className="text-sm text-white/70 hover:text-white">Ubicación</a>
              
              {/* NUEVO BOTÓN RESERVAR EN EL MENÚ MÓVIL */}
              <button 
                onClick={scrollToReserva}
                className="text-sm px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 transition-colors rounded-md w-full text-center"
              >
                Reservar mesa
              </button>
              
              {user ? (
                <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
                  <span className="text-sm text-white font-medium">{user.name || user.email}</span>
                  <Link to="/perfil" className="text-sm text-amber-200">Mis Reservas</Link>
                  {isAdmin && (
                    <Link to="/admin" className="text-sm text-amber-200 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-sm text-white/50 text-left">Cerrar Sesión</button>
                </div>
              ) : (
                <button onClick={() => { setIsOpen(false); setIsLoginModalOpen(true); }} className="text-sm px-5 py-2.5 text-center bg-white text-black">
                  Ingresar
                </button>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* MODAL LOGIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 p-8 md:p-10 w-full max-w-[400px] relative shadow-2xl">
            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><FiX className="w-5 h-5"/></button>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif text-white tracking-tight">{isRegistering ? 'Crear Cuenta' : 'Bienvenido'}</h2>
              <p className="text-xs text-white/50 uppercase tracking-widest mt-2">Acceso Premium</p>
            </div>
            {authMensaje && <p className="bg-red-950/50 text-red-400 p-3 text-xs mb-6 text-center border border-red-900/50 font-medium">{authMensaje}</p>}
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              {isRegistering && (
                <input type="text" name="name" onChange={handleAuthChange} placeholder="Nombre completo" className="bg-[#050505] border border-white/10 h-12 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-200 transition-colors text-sm" required />
              )}
              <input type="email" name="email" onChange={handleAuthChange} placeholder="Correo electrónico" className="bg-[#050505] border border-white/10 h-12 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-200 transition-colors text-sm" required />
              <input type="password" name="password" onChange={handleAuthChange} placeholder="Contraseña" className="bg-[#050505] border border-white/10 h-12 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-200 transition-colors text-sm" required />
              <button type="submit" className="bg-white h-12 text-black text-sm font-medium hover:bg-amber-100 transition-colors mt-2">
                {isRegistering ? 'Registrar' : 'Entrar'}
              </button>
            </form>
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-xs text-white/50 mt-6 block w-full text-center hover:text-white transition-colors">
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
            <div className="relative my-8"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div><div className="relative flex justify-center text-xs uppercase font-bold"><span className="bg-[#111] px-4 text-white/40">O accede con</span></div></div>
            <button onClick={handleGoogleLogin} className="w-full bg-[#050505] text-white border border-white/10 h-12 text-sm font-medium flex items-center justify-center gap-3 hover:bg-white/5 transition-all">
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.91 2.26c1.7-1.57 2.68-3.88 2.68-6.61z" fill="#4285F4"/><path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71L.93 13.04C2.41 15.99 5.46 18 9 18z" fill="#34A853"/><path d="M3.96 10.71c-.18-.54-.28-1.12-.28-1.71s.1-1.17.28-1.71V4.96H.93C.34 6.17 0 7.55 0 9s.34 2.83.93 4.04l3.03-2.33z" fill="#FBBC05"/><path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.86 11.43 0 9 0 5.46 0 2.41 2.01.93 4.96l3.03 2.33C4.67 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/></svg>
              Google
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section id="inicio" className="relative min-h-screen">
        <div className="absolute inset-0">
           <img src={heroImg} alt="Carnes premium" className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>
        <div className="relative z-10 min-h-screen flex flex-col justify-between pt-24 pb-8">
          <div className="container mx-auto px-6 lg:px-12 flex-1 flex items-center">
            <div className="max-w-2xl">
              <span className="inline-block text-white/60 text-sm uppercase tracking-[0.3em] mb-6">
                Puerto Montt, Patagonia
              </span>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] tracking-tight">
                Buffet
                <span className="block italic text-amber-200">Premium</span>
              </h1>
              <p className="mt-8 text-white/70 text-lg md:text-xl max-w-md leading-relaxed">
                Carnes premium cocinadas a fuego lento. Una experiencia gastronómica única en el sur de Chile.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <button 
                  onClick={scrollToReserva}
                  className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-sm font-medium hover:bg-amber-100 transition-colors"
                >
                  Reservar mesa
                  <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="#buffet" className="inline-flex items-center gap-3 text-white/80 hover:text-white border border-white/30 hover:border-white/60 px-8 py-4 text-sm transition-all">
                  Ver menú
                </a>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex flex-wrap gap-12 md:gap-20 py-8 border-t border-white/10">
              <div>
                <span className="block font-serif text-4xl md:text-5xl text-white">5+</span>
                <span className="block mt-1 text-xs text-white/50 uppercase tracking-wider">Cortes</span>
              </div>
                <div className="text-center">
                <span className="block font-serif text-4xl md:text-5xl text-white">4</span>
                <span className="block mt-1 text-xs text-white/50 uppercase tracking-wider">
                  Horas de servicio
                </span>
              </div>
              <div>
                <span className="block font-serif text-4xl md:text-5xl text-amber-200">$24.990</span>
                <span className="block mt-1 text-xs text-white/50 uppercase tracking-wider">Por persona</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MENU SECTION */}
      <section id="buffet" className="py-20 md:py-28">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <span className="text-xs text-white/40 uppercase tracking-[0.2em]">Nuestro Menú</span>
              <h2 className="mt-3 font-serif text-3xl md:text-5xl text-white">
                Experiencia <span className="italic text-amber-200">sin límites</span>
              </h2>
            </div>
            <p className="text-white/50 text-sm max-w-xs">
              Todo lo que puedas disfrutar. Sin restricciones, sin tiempos.
            </p>
          </div>
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            <div className="lg:col-span-2 relative aspect-[3/4] lg:aspect-auto">
              <img src={lambFire} alt="Cordero al palo" className="object-cover w-full h-full" />
            </div>
            <div className="lg:col-span-3">
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-8">
                {menuCategories.map((category) => (
                  <div key={category.title} className="border-l-2 border-amber-500/30 pl-5">
                    <h3 className="font-serif text-xl text-white mb-3">{category.title}</h3>
                    <ul className="space-y-1.5">
                      {category.items.map((item) => (
                        <li key={item} className="text-white/60 text-sm">{item}</li>
                      ))}
                    </ul>
                    {category.badge && (
                      <span className="inline-block mt-3 text-xs text-amber-500 font-medium">{category.badge}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-6">
                <div>
                  <span className="text-xs text-white/40 uppercase tracking-wider">Precio por persona</span>
                  <p className="mt-1 font-serif text-4xl text-white">$24.990</p>
                </div>
                <div className="text-sm text-white/50">
                  <p>Menores de 10 años: <span className="text-white">50% dcto</span></p>
                  <p>Menores de 4 años: <span className="text-white">Gratis</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESERVATION SECTION */}
      <section id="reserva" className="py-20 md:py-28 border-t border-white/10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-14">
            <span className="text-xs text-white/40 uppercase tracking-[0.2em]">Reservaciones</span>
            <h2 className="mt-3 font-serif text-3xl md:text-5xl text-white">
              Reserva <span className="italic text-amber-200">tu mesa</span>
            </h2>
            <p className="mt-4 text-white/50 text-sm max-w-md mx-auto">
              Completa el formulario y recibirás confirmación inmediata.
              {!user && <span className="block mt-2 text-amber-500"> ¡Para mejor expereriencia registrate para reservar!</span>}
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {mensaje && (
              <div className={`mb-6 p-4 text-sm text-center border ${mensaje.includes('❌') ? 'bg-red-950/30 text-red-400 border-red-900/50' : 'bg-green-950/30 text-green-400 border-green-900/50'}`}>
                {mensaje}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">
                  Nombre completo {!user && <span className="text-amber-500">*</span>}
                </label>
                <input 
                  type="text" 
                  name="customerName" 
                  value={formData.customerName} 
                  onChange={handleChange} 
                  placeholder="Tu nombre" 
                  className="w-full bg-[#111] border border-white/10 h-12 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-200 transition-colors" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">
                    Email {!user && <span className="text-amber-500">*</span>}
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="tu@email.com" 
                    className="w-full bg-[#111] border border-white/10 h-12 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-200 transition-colors" 
                    required 
                  />
                  {!user && (
                    <p className="text-[10px] text-white/30 mt-1">
                      Recibirás la confirmación en este correo
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">
                    WhatsApp {!user && <span className="text-amber-500">*</span>}
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="+56 9 1234 5678" 
                    className="w-full bg-[#111] border border-white/10 h-12 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-200 transition-colors" 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">Personas</label>
                  <select name="guestCount" value={formData.guestCount} onChange={handleChange} className="w-full bg-[#111] border border-white/10 h-12 px-4 text-white focus:outline-none focus:border-amber-200 transition-colors appearance-none">
                    {[1,2,3,4,5,6,8,10,12].map(n => <option key={n} value={n} className="bg-[#111] text-white">{n} Personas</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">Fecha</label>
                  <DatePicker 
                    selected={startDate} 
                    onChange={handleDateChange} 
                    filterDate={isWeekday} 
                    minDate={new Date()} 
                    placeholderText="Seleccionar fecha" 
                    dateFormat="dd/MM/yyyy" 
                    locale="es" 
                    className="w-full bg-[#111] border border-white/10 h-12 px-4 text-white focus:outline-none focus:border-amber-200 transition-colors" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">Hora</label>
                  <select 
                    name="time" 
                    value={formData.time} 
                    onChange={handleChange} 
                    className="w-full bg-[#111] border border-white/10 h-12 px-4 text-white focus:outline-none focus:border-amber-200 transition-colors appearance-none disabled:opacity-50" 
                    required 
                    disabled={!startDate}
                  >
                    <option value="" className="bg-[#111] text-white/50">Seleccionar hora</option>
                    {obtenerHorasDisponibles(startDate).map(h => (
                      <option key={h} value={h} className="bg-[#111] text-white">{h} hrs</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting || isSubmitted} 
                className="w-full h-14 bg-white text-black text-sm font-medium flex items-center justify-center gap-3 hover:bg-amber-100 disabled:opacity-70 transition-all group mt-8"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> 
                    Procesando...
                  </span>
                ) : isSubmitted ? (
                  <span className="flex items-center gap-2 text-green-700">
                    <FaCheck className="w-4 h-4" /> 
                    Reserva confirmada
                  </span>
                ) : (
                  <>
                    Confirmar reserva 
                    <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-8 text-sm text-white/50">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> 
                Sin cargos extra
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> 
                Cancelación flexible
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> 
                Confirmación inmediata
              </span>
            </div>
            
            {!user && (
              <div className="mt-6 text-center">
                <p className="text-xs text-white/30">
                  ¿Quieres ver el historial de tus reservas? 
                  <button onClick={() => setIsLoginModalOpen(true)} className="text-amber-500 hover:text-amber-400 ml-1">
                    Inicia sesión
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* LOCATION SECTION */}
      <section id="ubicacion" className="py-20 md:py-28 bg-white text-black">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative aspect-[4/3] overflow-hidden order-2 lg:order-1">
              <img src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000" alt="Interior del restaurante" className="object-cover w-full h-full" />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-xs text-black/40 uppercase tracking-[0.2em]">Visítanos</span>
              <h2 className="mt-3 font-serif text-3xl md:text-5xl text-black leading-tight">
                Puerto Montt,<br />
                <span className="italic text-amber-600">Patagonia</span>
              </h2>
              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-black font-medium">Camino El Tepual Km 3.5</p>
                    <p className="text-black/60 text-sm">Puerto Montt, Los Lagos</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FaRegClock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-black font-medium">Jue - Dom: 13:00 - 22:00</p>
                    <p className="text-black/60 text-sm">Viernes y Sábado hasta las 23:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FaPhoneAlt className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-black font-medium">+56 9 1234 5678</p>
                    <p className="text-black/60 text-sm">WhatsApp disponible</p>
                  </div>
                </div>
              </div>
              <a href="https://maps.google.com/?q=Puerto+Montt+Chile" target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-sm font-medium hover:bg-neutral-800 transition-colors group">
                Ver en Google Maps <FiArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="py-12 md:py-16 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div>
              <Link to="/" className="inline-block">
                <span className="font-serif text-2xl md:text-3xl text-white">Tenedor Libre</span>
              </Link>
              <p className="mt-2 text-white/50 text-sm max-w-xs">
                Buffet premium de carnes patagónicas en Puerto Montt, Chile.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group text-sm">
                <FaInstagram className="w-4 h-4" /> @tenedorlibrepatagonia
                <FiArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
          <div className="py-5 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
            <p>{new Date().getFullYear()} Tenedor Libre Patagonia</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;