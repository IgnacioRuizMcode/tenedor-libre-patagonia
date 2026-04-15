import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Plus, 
  Minus, 
  Trash2, 
  LogOut,
  User,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  CalendarDays,
  AlertCircle
} from "lucide-react";

axios.defaults.withCredentials = true;

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [notificacion, setNotificacion] = useState({ mensaje: '', tipo: '', visible: false });
  const [confirmModal, setConfirmModal] = useState({ 
    visible: false, 
    type: '', 
    id: null, 
    currentPax: null, 
    newPax: null,
    fecha: null 
  });

  const fetchData = async () => {
    try {
      const userRes = await axios.get('http://localhost:5000/api/auth/current-user');
      setUser(userRes.data);
      const reservasRes = await axios.get('http://localhost:5000/api/reservas/mis-reservas');
      setReservas(reservasRes.data);
    } catch (error) { 
      window.location.href = '/'; 
    } finally { 
      setCargando(false); 
    }
  };

  const mostrarToast = (msg, tipo = 'success') => {
    setNotificacion({ mensaje: msg, tipo, visible: true });
    setTimeout(() => setNotificacion({ mensaje: '', tipo: '', visible: false }), 4000);
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/api/auth/logout');
      window.location.reload();
    } catch (error) {
      mostrarToast("❌ Error al cerrar sesión", 'error');
    }
  };

  // Abrir modal de confirmación para cancelar
  const openCancelModal = (id, fecha) => {
    setConfirmModal({
      visible: true,
      type: 'cancel',
      id: id,
      fecha: fecha,
      currentPax: null,
      newPax: null
    });
  };

  // Abrir modal de confirmación para cambiar cantidad de personas
  const openUpdatePaxModal = (id, currentPax, change) => {
    const newPax = currentPax + change;
    if (newPax < 1) {
      mostrarToast("⚠️ Mínimo 1 persona por reserva.", 'error');
      return;
    }
    if (newPax > 12) {
      mostrarToast("⚠️ Máximo 12 personas por reserva.", 'error');
      return;
    }
    
    setConfirmModal({
      visible: true,
      type: 'updatePax',
      id: id,
      currentPax: currentPax,
      newPax: newPax,
      fecha: null
    });
  };

  // Confirmar cancelación
  const confirmCancel = async () => {
    const { id, fecha } = confirmModal;
    try {
      await axios.delete(`http://localhost:5000/api/reservas/${id}`);
      mostrarToast("✅ Reserva anulada correctamente. Se ha notificado al restaurante.", 'success');
      fetchData(); 
    } catch (error) { 
      mostrarToast("❌ Error al anular la reserva.", 'error'); 
    } finally {
      setConfirmModal({ visible: false, type: '', id: null, currentPax: null, newPax: null, fecha: null });
    }
  };

  // Confirmar cambio de cantidad de personas
  const confirmUpdatePax = async () => {
    const { id, newPax } = confirmModal;
    try {
      await axios.put(`http://localhost:5000/api/reservas/update-pax/${id}`, { guestCount: newPax });
      mostrarToast(`✅ Cantidad actualizada: ${newPax} personas. Se ha notificado al restaurante.`, 'success');
      fetchData();
    } catch (err) {
      mostrarToast("⚠️ Error al actualizar la cantidad.", 'error');
    } finally {
      setConfirmModal({ visible: false, type: '', id: null, currentPax: null, newPax: null, fecha: null });
    }
  };

  const agregarAGoogleCalendar = (res) => {
    const [y, m, d] = res.date.split('-');
    const [h, min] = res.time.split(':');
    const start = `${y}${m}${d}T${h}${min}00`;
    
    let endH = parseInt(h) + 2; 
    const end = `${y}${m}${d}T${String(endH).padStart(2, '0')}${min}00`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Tenedor+Libre+Patagonia&dates=${start}/${end}&details=Reserva+confirmada+para+${res.guestCount}+personas.&location=Camino+El+Tepual+Km+3.5,+Puerto+Montt`;
    
    window.open(url, '_blank');
  };

  const formatearFechaChile = (f) => {
    if (!f) return "";
    const [y, m, d] = f.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatearFechaParaDisplay = (f) => {
    if (!f) return "";
    const [y, m, d] = f.split('-');
    const fecha = new Date(y, m - 1, d);
    return fecha.toLocaleDateString('es-CL', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/40 text-sm uppercase tracking-wider">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proximas = reservas.filter(res => new Date(res.date + 'T23:59:59') >= hoy);
  const pasadas = reservas.filter(res => new Date(res.date + 'T23:59:59') < hoy);
  
  const totalPersonas = reservas.reduce((sum, res) => sum + res.guestCount, 0);
  const totalReservas = reservas.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#050505] text-white">
      
      {/* NOTIFICACIÓN TOAST */}
      {notificacion.visible && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl border flex items-center gap-3 animate-slide-up ${
          notificacion.tipo === 'success' 
            ? 'bg-green-500/90 border-green-400 text-white' 
            : 'bg-red-500/90 border-red-400 text-white'
        }`}>
          {notificacion.tipo === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{notificacion.mensaje}</span>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {confirmModal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-serif">Confirmar acción</h3>
            </div>
            
            {confirmModal.type === 'cancel' && (
              <>
                <p className="text-white/70 mb-6">
                  ¿Estás seguro de que deseas <span className="text-red-500 font-semibold">cancelar</span> tu reserva para el día <span className="text-amber-500">{confirmModal.fecha}</span>?
                </p>
                <p className="text-xs text-white/40 mb-6">
                  Esta acción no se puede deshacer. Se enviará una notificación al restaurante.
                </p>
              </>
            )}
            
            {confirmModal.type === 'updatePax' && (
              <>
                <p className="text-white/70 mb-6">
                  ¿Estás seguro de que deseas cambiar la cantidad de personas de 
                  <span className="text-white font-bold"> {confirmModal.currentPax} </span> 
                  a 
                  <span className="text-amber-500 font-bold"> {confirmModal.newPax} </span>
                  {confirmModal.newPax === 1 ? ' persona' : ' personas'}?
                </p>
                <p className="text-xs text-white/40 mb-6">
                  Se enviará una notificación al restaurante sobre este cambio.
                </p>
              </>
            )}
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ visible: false, type: '', id: null, currentPax: null, newPax: null, fecha: null })}
                className="px-4 py-2 border border-white/20 rounded-md text-white/60 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.type === 'cancel' ? confirmCancel : confirmUpdatePax}
                className={`px-4 py-2 rounded-md transition-colors ${
                  confirmModal.type === 'cancel' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-amber-500 hover:bg-amber-600 text-black'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs uppercase tracking-wider">Volver al inicio</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider border border-white/10 rounded-md hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* PERFIL HEADER */}
        <div className="flex items-center gap-6 mb-12 pb-8 border-b border-white/10">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border-2 border-amber-500/30">
              {user?.avatar ? (
                <img src={user.avatar} className="w-18 h-18 rounded-full object-cover" alt="Avatar" />
              ) : (
                <User className="w-8 h-8 text-amber-500" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#050505]"></div>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif tracking-tight">
              {user?.name || 'Usuario'}
            </h1>
            <p className="text-white/40 text-sm mt-1">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs px-2 py-1 bg-white/5 rounded-md text-white/50">
                Cliente desde 2024
              </span>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-[#111] border border-white/10 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <CalendarDays className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-bold text-white">{totalReservas}</span>
            </div>
            <p className="text-xs text-white/40 uppercase tracking-wider">Reservas Totales</p>
          </div>
          
          <div className="bg-[#111] border border-white/10 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold text-white">{totalPersonas}</span>
            </div>
            <p className="text-xs text-white/40 uppercase tracking-wider">Personas Recibidas</p>
          </div>
          
          <div className="bg-[#111] border border-white/10 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold text-amber-500">VIP</span>
            </div>
            <p className="text-xs text-white/40 uppercase tracking-wider">Nivel de Cliente</p>
          </div>
        </div>

        {/* RESERVAS PRÓXIMAS */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
              Próximas Visitas
            </h2>
            <div className="w-12 h-px bg-white/10"></div>
          </div>

          {proximas.length === 0 ? (
            <div className="text-center py-16 bg-[#111] border border-white/10 rounded-lg">
              <Calendar className="w-12 h-12 mx-auto text-white/20 mb-4" />
              <p className="text-white/40 mb-4">No tienes reservas programadas</p>
              <Link 
                to="/#reserva" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black text-sm font-medium hover:bg-amber-400 transition-colors rounded-md"
              >
                Hacer una Reserva
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {proximas.map((res) => (
                <div
                  key={res._id}
                  className="group bg-[#111] border border-white/10 rounded-lg p-6 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* FECHA Y HORA */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-500">{res.time} HRS</span>
                      </div>
                      <h3 className="text-2xl font-serif tracking-tight capitalize">
                        {formatearFechaParaDisplay(res.date)}
                      </h3>
                      <button 
                        onClick={() => agregarAGoogleCalendar(res)}
                        className="inline-flex items-center gap-2 mt-3 text-xs text-white/40 hover:text-white transition-colors"
                      >
                        <Calendar className="w-3 h-3" />
                        Agendar en Google Calendar
                      </button>
                    </div>

                    {/* SELECTOR DE PERSONAS */}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-white/40">
                        Ajustar Personas
                      </span>
                      <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/10 rounded-md p-1">
                        <button
                          onClick={() => openUpdatePaxModal(res._id, res.guestCount, -1)}
                          className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <div className="w-12 text-center font-bold text-lg">
                          {res.guestCount}
                        </div>
                        <button
                          onClick={() => openUpdatePaxModal(res._id, res.guestCount, 1)}
                          className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* BOTÓN CANCELAR */}
                    <button
                      onClick={() => openCancelModal(res._id, formatearFechaChile(res.date))}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-all text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Anular Reserva
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RESERVAS PASADAS */}
        {pasadas.length > 0 && (
          <section className="opacity-60">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
                Historial de Visitas
              </h2>
              <div className="w-12 h-px bg-white/5"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pasadas.map((res) => (
                <div
                  key={res._id}
                  className="bg-[#111]/50 border border-white/5 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/30">{res.time} HRS</span>
                    <span className="text-[10px] text-white/20 italic">Finalizada</span>
                  </div>
                  <p className="font-medium text-white/60 text-sm">
                    {formatearFechaChile(res.date)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/30">
                    <Users className="w-3 h-3" />
                    <span>{res.guestCount} personas</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* INFO ADICIONAL */}
        <section className="mt-16 pt-8 border-t border-white/10">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/70">
                  🍽️ Recuerda que puedes modificar la cantidad de personas hasta 24 horas antes.
                </p>
                <p className="text-xs text-white/40 mt-1">
                  Cancelación flexible sin costo adicional. Se notificará automáticamente al restaurante.
                </p>
              </div>
              <Link 
                to="/#reserva"
                className="px-6 py-2 bg-amber-500 text-black text-sm font-medium hover:bg-amber-400 transition-colors rounded-md whitespace-nowrap"
              >
                Nueva Reserva
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default UserDashboard;