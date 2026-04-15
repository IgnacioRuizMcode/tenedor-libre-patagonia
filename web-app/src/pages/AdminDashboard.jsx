import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  ClipboardList, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Download, 
  RefreshCw,
  TrendingUp,
  Clock,
  UserCheck,
  AlertCircle,
  X
} from "lucide-react";

const PRICE_PER_PERSON = 24990;

const mockReservations = [
  { id: "1", date: "2026-05-02", time: "21:30", clientName: "Ignacio Ruiz", email: "ignacio@email.com", phone: "+56912345678", registeredAt: "03-ABR, 10:55 A.M.", guests: 10, status: "confirmed" },
  { id: "2", date: "2026-04-25", time: "16:30", clientName: "Ignacio Ruiz", email: "ignacio@email.com", phone: "+56912345678", registeredAt: "03-ABR, 10:51 A.M.", guests: 12, status: "confirmed" },
  { id: "3", date: "2026-04-25", time: "14:00", clientName: "Ignacio Ruiz", email: "ignacio@email.com", phone: "+56912345678", registeredAt: "03-ABR, 10:44 A.M.", guests: 3, status: "pending" },
  { id: "4", date: "2026-04-19", time: "17:00", clientName: "Ignacio Ruiz", email: "ignacio@email.com", phone: "+56912345678", registeredAt: "03-ABR, 10:40 A.M.", guests: 6, status: "confirmed" },
  { id: "5", date: "2026-04-12", time: "13:00", clientName: "Maria Lopez", email: "maria@email.com", phone: "+56987654321", registeredAt: "02-ABR, 15:22 A.M.", guests: 8, status: "cancelled" },
  { id: "6", date: "2026-05-03", time: "20:00", clientName: "Carlos Rodriguez", email: "carlos@email.com", phone: "+56911223344", registeredAt: "03-ABR, 09:15 A.M.", guests: 4, status: "confirmed" },
];

export default function AdminDashboard() {
  const [reservations, setReservations] = useState(
    mockReservations.map(r => ({
      ...r,
      estimatedRevenue: r.guests * PRICE_PER_PERSON
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Estado para el modal de confirmación
  const [confirmModal, setConfirmModal] = useState({ 
    visible: false, 
    type: '', // 'delete' o 'updatePax'
    id: null, 
    currentPax: null, 
    newPax: null,
    clientName: null,
    date: null
  });

  const filteredReservations = reservations.filter(r => {
    const matchesSearch =
      r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm);
    
    const matchesDate = !dateFilter || r.date === dateFilter;
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  const totalRevenue = filteredReservations.reduce((sum, r) => sum + r.estimatedRevenue, 0);
  const totalGuests = filteredReservations.reduce((sum, r) => sum + r.guests, 0);
  const confirmedCount = filteredReservations.filter(r => r.status === "confirmed").length;
  const pendingCount = filteredReservations.filter(r => r.status === "pending").length;

  // Abrir modal para ajustar personas
  const openUpdatePaxModal = (id, currentPax, clientName, date) => {
    setConfirmModal({
      visible: true,
      type: 'updatePax',
      id: id,
      currentPax: currentPax,
      newPax: currentPax,
      clientName: clientName,
      date: date
    });
  };

  // Abrir modal para eliminar reserva
  const openDeleteModal = (id, clientName, date) => {
    setConfirmModal({
      visible: true,
      type: 'delete',
      id: id,
      clientName: clientName,
      date: date,
      currentPax: null,
      newPax: null
    });
  };

  // Confirmar cambio de cantidad de personas
  const confirmUpdatePax = () => {
    const { id, newPax } = confirmModal;
    setReservations(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        return {
          ...r,
          guests: newPax,
          estimatedRevenue: newPax * PRICE_PER_PERSON
        };
      })
    );
    setConfirmModal({ visible: false, type: '', id: null, currentPax: null, newPax: null, clientName: null, date: null });
  };

  // Confirmar eliminación
  const confirmDelete = () => {
    const { id } = confirmModal;
    setReservations(prev => prev.filter(r => r.id !== id));
    setConfirmModal({ visible: false, type: '', id: null, currentPax: null, newPax: null, clientName: null, date: null });
  };

  // Cambiar la cantidad en el modal
  const changeModalPax = (delta) => {
    setConfirmModal(prev => {
      const newPax = Math.max(1, Math.min(50, (prev.newPax || prev.currentPax) + delta));
      return { ...prev, newPax: newPax };
    });
  };

  const updateStatus = (id, newStatus) => {
    setReservations(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: newStatus } : r
      )
    );
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CL", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric" 
    });
  };

  const exportToCSV = () => {
    const headers = ["Fecha", "Hora", "Cliente", "Email", "Teléfono", "PAX", "Ingreso", "Estado"];
    const data = filteredReservations.map(r => [
      formatDate(r.date),
      r.time,
      r.clientName,
      r.email,
      r.phone,
      r.guests,
      formatCurrency(r.estimatedRevenue),
      r.status
    ]);
    
    const csvContent = [headers, ...data].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "reservas.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
    setStatusFilter("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#050505] text-white">
      
      {/* MODAL DE CONFIRMACIÓN */}
      {confirmModal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-serif">
                  {confirmModal.type === 'delete' ? 'Confirmar eliminación' : 'Modificar cantidad'}
                </h3>
              </div>
              <button
                onClick={() => setConfirmModal({ visible: false, type: '', id: null, currentPax: null, newPax: null, clientName: null, date: null })}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {confirmModal.type === 'delete' && (
              <>
                <p className="text-white/70 mb-2">
                  ¿Estás seguro de que deseas <span className="text-red-500 font-semibold">eliminar</span> la reserva de <span className="text-amber-500 font-semibold">{confirmModal.clientName}</span>?
                </p>
                <p className="text-sm text-white/40 mb-6">
                  Fecha: {confirmModal.date}<br />
                  Esta acción no se puede deshacer.
                </p>
              </>
            )}
            
            {confirmModal.type === 'updatePax' && (
              <>
                <p className="text-white/70 mb-4">
                  Modificando reserva de <span className="text-amber-500 font-semibold">{confirmModal.clientName}</span>
                </p>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-sm">Cantidad actual:</span>
                    <span className="text-white font-bold">{confirmModal.currentPax} personas</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-white/50 text-sm">Nueva cantidad:</span>
                    <div className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-md p-1">
                      <button
                        onClick={() => changeModalPax(-1)}
                        className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <div className="w-12 text-center font-bold text-lg text-amber-500">
                        {confirmModal.newPax || confirmModal.currentPax}
                      </div>
                      <button
                        onClick={() => changeModalPax(1)}
                        className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <span className="text-white/50 text-sm">Nuevo ingreso:</span>
                    <span className="text-green-500 font-bold">
                      {formatCurrency((confirmModal.newPax || confirmModal.currentPax) * PRICE_PER_PERSON)}
                    </span>
                  </div>
                </div>
              </>
            )}
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ visible: false, type: '', id: null, currentPax: null, newPax: null, clientName: null, date: null })}
                className="px-4 py-2 border border-white/20 rounded-md text-white/60 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.type === 'delete' ? confirmDelete : confirmUpdatePax}
                className={`px-4 py-2 rounded-md transition-colors ${
                  confirmModal.type === 'delete' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-amber-500 hover:bg-amber-600 text-black'
                }`}
              >
                {confirmModal.type === 'delete' ? 'Eliminar' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-serif tracking-tight bg-gradient-to-r from-amber-200 to-white bg-clip-text text-transparent">
                Panel de Administración
              </h1>
              <p className="text-sm text-white/40 mt-1">Gestión de reservas · Tenedor Libre Patagonia</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-white/10 hover:bg-white/5 transition-colors rounded-md"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
              <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm bg-white text-black hover:bg-amber-100 transition-colors rounded-md">
                Ver sitio
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-lg p-5 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-500" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-amber-500">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-white/40 uppercase tracking-wider mt-1">Ingreso Total</p>
          </div>

          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-lg p-5 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold">{totalGuests}</p>
            <p className="text-xs text-white/40 uppercase tracking-wider mt-1">Cubiertos Totales</p>
          </div>

          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-lg p-5 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <p className="text-2xl font-bold">{filteredReservations.length}</p>
            <p className="text-xs text-white/40 uppercase tracking-wider mt-1">Total Reservas</p>
          </div>

          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-lg p-5 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-500">{confirmedCount}</p>
            <p className="text-xs text-white/40 uppercase tracking-wider mt-1">Confirmadas</p>
          </div>

          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-lg p-5 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
            <p className="text-xs text-white/40 uppercase tracking-wider mt-1">Pendientes</p>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-[#111] border border-white/10 rounded-lg p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-[#0a0a0a] border border-white/10 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0a0a0a] border border-white/10 rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
              >
                <option value="all">Todos los estados</option>
                <option value="confirmed">Confirmadas</option>
                <option value="pending">Pendientes</option>
                <option value="cancelled">Canceladas</option>
              </select>

              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-white/10 hover:bg-white/5 transition-colors rounded-md"
              >
                <RefreshCw className="w-4 h-4" />
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* TABLA DE RESERVAS */}
        <div className="bg-[#111] border border-white/10 rounded-lg overflow-hidden">
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-[#0a0a0a] border-b border-white/10 text-xs text-white/40 uppercase tracking-wider">
            <div className="col-span-2">Fecha / Hora</div>
            <div className="col-span-3">Cliente</div>
            <div className="col-span-2 text-center">PAX</div>
            <div className="col-span-2">Ingreso</div>
            <div className="col-span-1 text-center">Estado</div>
            <div className="col-span-2 text-right">Acciones</div>
          </div>

          <div className="divide-y divide-white/5">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-5 hover:bg-white/5 transition-colors"
              >
                <div className="lg:col-span-2">
                  <p className="font-medium">{formatDate(reservation.date)}</p>
                  <p className="text-sm text-amber-500">{reservation.time} hrs</p>
                  <p className="text-xs text-white/30 mt-1">{reservation.registeredAt}</p>
                </div>

                <div className="lg:col-span-3">
                  <p className="font-semibold text-white">{reservation.clientName}</p>
                  <p className="text-sm text-white/50">{reservation.email}</p>
                  <p className="text-xs text-white/30">{reservation.phone}</p>
                </div>

                <div className="lg:col-span-2 flex items-center justify-start lg:justify-center">
                  <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/10 rounded-md px-2 py-1">
                    <button
                      onClick={() => openUpdatePaxModal(reservation.id, reservation.guests, reservation.clientName, formatDate(reservation.date))}
                      className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center font-semibold">{reservation.guests}</span>
                    <button
                      onClick={() => openUpdatePaxModal(reservation.id, reservation.guests, reservation.clientName, formatDate(reservation.date))}
                      className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 flex items-center">
                  <p className="font-bold text-green-500">{formatCurrency(reservation.estimatedRevenue)}</p>
                </div>

                <div className="lg:col-span-1 flex items-center justify-start lg:justify-center">
                  <select
                    value={reservation.status}
                    onChange={(e) => updateStatus(reservation.id, e.target.value)}
                    className={`px-2 py-1 text-xs rounded-md border focus:outline-none transition-colors ${
                      reservation.status === "confirmed" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                      reservation.status === "pending" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                      "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    <option value="confirmed">Confirmada</option>
                    <option value="pending">Pendiente</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>

                <div className="lg:col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openDeleteModal(reservation.id, reservation.clientName, formatDate(reservation.date))}
                    className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors"
                    title="Eliminar reserva"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredReservations.length === 0 && (
            <div className="text-center py-16">
              <ClipboardList className="w-12 h-12 mx-auto text-white/20 mb-4" />
              <p className="text-white/40">No se encontraron reservas</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-amber-500 hover:text-amber-400 text-sm"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-[#111] border border-white/10 rounded-lg">
          <p className="text-sm text-white/40">
            Mostrando {filteredReservations.length} de {reservations.length} reservas
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{totalGuests}</p>
              <p className="text-xs text-white/40 uppercase tracking-wider">Total PAX</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-white/40 uppercase tracking-wider">Ingreso Total</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}