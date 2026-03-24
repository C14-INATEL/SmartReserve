/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Search, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  BookOpen, 
  ChevronRight, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  X,
  Menu,
  Laptop,
  Building2,
  Microscope,
  Settings,
  Camera,
  ChevronDown,
  UserCircle,
  Home,
  Plus,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, startOfToday, isSameDay, isWithinInterval, parse, setHours, isAfter, isBefore, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from './lib/utils';
import { Resource, Booking, User, View, ResourceType } from './types';
import {
  apiLogin,
  apiFetchResources,
  apiFetchReservations,
  apiCreateReservation,
  apiDeleteReservation,
  apiCreateResource
} from './lib/api';

const SESSION_KEY = 'smartreserve_user';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<User | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [filterType, setFilterType] = useState<ResourceType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [appError, setAppError] = useState('');

  const loadAppData = async (userId: string) => {
    setAppError('');
    try {
      const [resList, bookList] = await Promise.all([
        apiFetchResources(),
        apiFetchReservations(userId)
      ]);
      setResources(resList);
      setBookings(bookList);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar dados';
      setAppError(msg);
    }
  };

  React.useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    try {
      const u = JSON.parse(raw) as User;
      setUser(u);
      void loadAppData(u.id);
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const apiUser = await apiLogin(matricula, senha);
      const u: User = {
        id: apiUser.id,
        name: apiUser.nome,
        matricula: apiUser.matricula,
        role: apiUser.role === 'admin' ? 'admin' : 'user',
        photoUrl: `https://picsum.photos/seed/m${apiUser.matricula}/200/200`
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
      setUser(u);
      await loadAppData(u.id);
      setView('home');
      setSenha('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    setResources([]);
    setBookings([]);
    setView('home');
  };

  // Filtered Resources
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchesType = filterType === 'all' || r.type === filterType;
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           r.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [resources, filterType, searchQuery]);

  const handleBook = async (resourceId: string, startTime: Date, duration: number) => {
    if (!user) return;
    const endTime = addHours(startTime, duration);

    const conflict = bookings.find(
      (b) =>
        b.resourceId === resourceId &&
        b.status === 'confirmed' &&
        ((isAfter(startTime, b.startTime) && isBefore(startTime, b.endTime)) ||
          (isAfter(endTime, b.startTime) && isBefore(endTime, b.endTime)) ||
          (isBefore(startTime, b.startTime) && isAfter(endTime, b.endTime)) ||
          startTime.getTime() === b.startTime.getTime())
    );

    if (conflict) {
      alert('Este horário já está reservado. Por favor, escolha outro.');
      return;
    }

    try {
      await apiCreateReservation({
        usuario: user.id,
        recurso: resourceId,
        data: startTime.toISOString(),
        horaInicio: format(startTime, 'HH:mm'),
        horaFim: format(endTime, 'HH:mm')
      });
      const bookList = await apiFetchReservations(user.id);
      setBookings(bookList);
      alert('Reserva realizada com sucesso!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao reservar');
    }
  };

  const handleCreateResource = async (newResource: Resource) => {
    try {
      const created = await apiCreateResource({
        name: newResource.name,
        description: newResource.description,
        type: newResource.type,
        imageUrl: newResource.imageUrl,
        horaInicio: newResource.availableHours.start,
        horaFim: newResource.availableHours.end
      });
      setResources((prev) => [...prev, created]);
      setIsCreateModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar recurso');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[140px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/20 blur-[140px] rounded-full" />
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md z-10 relative flex flex-col items-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-28 h-28 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center mb-16 border border-white/10 shadow-2xl"
          >
            <UserIcon className="w-14 h-14 text-white/40" />
          </motion.div>

          <form onSubmit={handleLogin} className="w-full space-y-6">
            {loginError && (
              <p className="text-center text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl py-3 px-4">
                {loginError}
              </p>
            )}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="username"
                required
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="MATRÍCULA"
                className="w-full pl-14 pr-6 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all text-xs font-bold tracking-[0.2em] backdrop-blur-sm"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="SENHA"
                className="w-full pl-14 pr-6 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all text-xs font-bold tracking-[0.2em] backdrop-blur-sm"
              />
            </motion.div>

            <motion.button
              type="submit"
              disabled={loginLoading}
              whileHover={{ scale: loginLoading ? 1 : 1.02, backgroundColor: '#ffffff', color: '#0f172a' }}
              whileTap={{ scale: loginLoading ? 1 : 0.98 }}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-4 rounded-full font-bold text-xs tracking-[0.3em] shadow-2xl transition-all mt-8 uppercase hover:shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loginLoading ? 'Entrando…' : 'Entrar'}
            </motion.button>

            <p className="text-center text-[10px] text-white/40 tracking-wide px-4">
              Acesso com matrícula e senha cadastrados pela instituição.
            </p>
          </form>

          <div className="mt-20 flex justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <div className="w-2 h-2 rounded-full bg-white/10" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-[#1a1a1a]">
      {/* Navigation */}
      <nav className="bg-white border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 h-16 items-center">
            {/* Left: Profile Dropdown */}
            <div className="flex items-center justify-start relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 hover:bg-black/5 rounded-2xl transition-all border border-transparent hover:border-black/5"
              >
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center overflow-hidden border border-black/5">
                  {user?.photoUrl ? (
                    <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-muted" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold leading-none">{user?.name}</p>
                  <p className="text-[10px] text-muted uppercase tracking-wider mt-0.5">Membro</p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted transition-transform", isProfileOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-black/5 p-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-black/5 mb-2">
                        <p className="text-xs font-bold text-muted uppercase tracking-widest">Minha Conta</p>
                      </div>
                      
                      <motion.button 
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.05)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setView('my-bookings'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted hover:text-black rounded-xl transition-all"
                      >
                        <BookOpen className="w-4 h-4" />
                        Minhas Reservas
                      </motion.button>
                      
                      <motion.button 
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.05)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setView('settings'); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted hover:text-black rounded-xl transition-all"
                      >
                        <Settings className="w-4 h-4" />
                        Configurações
                      </motion.button>
                      
                      <div className="h-px bg-black/5 my-2" />
                      
                      <motion.button 
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(239,68,68,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 rounded-xl transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </motion.button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Middle: SmartReserve */}
            <div 
              className="flex items-center justify-center gap-2 cursor-pointer" 
              onClick={() => setView('home')}
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <CalendarIcon className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">SmartReserve</span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-2">
              {user?.role === 'admin' && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black/90 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Novo Recurso</span>
                </motion.button>
              )}
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setView('home')}
                className="p-2 rounded-full transition-colors text-muted hover:text-black"
                title="Início"
              >
                <Home className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Recursos Disponíveis</h2>
                  <p className="text-muted">Explore e reserve salas, laboratórios e equipamentos.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input 
                      type="text" 
                      placeholder="Buscar recurso..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white border border-black/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 w-full sm:w-64"
                    />
                  </div>
                  <div className="flex bg-white border border-black/5 rounded-xl p-1">
                    {(['all', 'room', 'lab', 'equipment'] as const).map((type) => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFilterType(type)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                          filterType === type ? "bg-black text-white shadow-sm" : "text-muted hover:text-black"
                        )}
                      >
                        {type === 'all' ? 'Todos' : type === 'room' ? 'Salas' : type === 'lab' ? 'Labs' : 'Equip.'}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <ResourceCard 
                    key={resource.id}
                    resource={resource} 
                    bookings={bookings}
                    onClick={() => {
                      setSelectedResource(resource);
                      setView('resource-details');
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {view === 'resource-details' && selectedResource && (
            <motion.div 
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-6">
                <button 
                  onClick={() => setView('home')}
                  className="flex items-center gap-2 text-sm font-medium text-muted hover:text-black transition-colors mb-4"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Voltar para Recursos
                </button>

                <div className="bg-white rounded-3xl overflow-hidden border border-black/5 shadow-sm">
                  <img 
                    src={selectedResource.imageUrl} 
                    alt={selectedResource.name}
                    className="w-full h-64 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted">
                        {selectedResource.type === 'room' ? 'Sala' : selectedResource.type === 'lab' ? 'Laboratório' : 'Equipamento'}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight mb-4">{selectedResource.name}</h2>
                    <p className="text-muted leading-relaxed mb-6">{selectedResource.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-black/5 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-muted" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Disponibilidade</p>
                          <p className="text-sm font-semibold">{selectedResource.availableHours.start} - {selectedResource.availableHours.end}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-muted" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Localização</p>
                          <p className="text-sm font-semibold">Bloco Central, Piso 2</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
                  <h3 className="text-xl font-bold mb-6">Agenda de Hoje</h3>
                  <div className="space-y-3">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const hour = 8 + i;
                      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                      const isBooked = bookings.some(b => 
                        b.resourceId === selectedResource.id && 
                        b.status === 'confirmed' &&
                        isSameDay(b.startTime, startOfToday()) &&
                        b.startTime.getHours() <= hour &&
                        b.endTime.getHours() > hour
                      );

                      return (
                        <div 
                          key={hour}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border transition-all",
                            isBooked 
                              ? "bg-black/5 border-transparent opacity-50 cursor-not-allowed" 
                              : "bg-white border-black/5 hover:border-black/20 cursor-pointer group"
                          )}
                          onClick={() => !isBooked && handleBook(selectedResource.id, setHours(startOfToday(), hour), 1)}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-mono font-medium text-muted">{timeStr}</span>
                            <div className="h-4 w-[1px] bg-black/10" />
                            <span className="text-sm font-medium">
                              {isBooked ? 'Horário Ocupado' : 'Disponível para Reserva'}
                            </span>
                          </div>
                          {!isBooked && (
                            <button className="text-xs font-bold uppercase tracking-widest text-black opacity-0 group-hover:opacity-100 transition-opacity">
                              Reservar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-black text-white rounded-3xl p-8 shadow-xl">
                  <h3 className="text-xl font-bold mb-4 font-display">Reserva Rápida</h3>
                  <p className="text-white/60 text-sm mb-6">Selecione um horário na agenda ao lado para confirmar sua reserva instantaneamente.</p>
                  <div className="space-y-4">
                    <motion.div 
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
                      className="p-4 bg-white/10 rounded-2xl border border-white/10 transition-colors"
                    >
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Regras de Uso</p>
                      <ul className="text-xs space-y-2 text-white/80">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Máximo de 4 horas por dia
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Cancelamento com 1h de antecedência
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Confirmação automática
                        </li>
                      </ul>
                    </motion.div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Outros Recursos</h3>
                  <div className="space-y-4">
                    {resources.filter(r => r.id !== selectedResource.id).slice(0, 3).map(r => (
                      <div 
                        key={r.id}
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setSelectedResource(r)}
                      >
                        <img 
                          src={r.imageUrl} 
                          alt={r.name} 
                          className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-sm font-semibold group-hover:text-black transition-colors">{r.name}</p>
                          <p className="text-[10px] text-muted uppercase tracking-wider">{r.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'my-bookings' && (
            <motion.div 
              key="my-bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Minhas Reservas</h2>
                <p className="text-muted">Acompanhe o status e horários dos seus agendamentos.</p>
              </div>

              <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-black/5 bg-[#fcfcfc]">
                        <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Recurso</th>
                        <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Data</th>
                        <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Horário</th>
                        <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted">Status</th>
                        <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-muted text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {bookings.filter(b => b.userId === user?.id).map((booking) => {
                        const resource = resources.find(r => r.id === booking.resourceId);
                        return (
                          <tr key={booking.id} className="hover:bg-black/[0.01] transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={resource?.imageUrl} 
                                  alt={resource?.name} 
                                  className="w-10 h-10 rounded-lg object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="font-semibold text-sm">{resource?.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-sm text-muted">
                              {format(booking.startTime, "dd 'de' MMMM", { locale: ptBR })}
                            </td>
                            <td className="px-8 py-6 text-sm font-mono">
                              {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}
                            </td>
                            <td className="px-8 py-6">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                booking.status === 'confirmed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                              )}>
                                {booking.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <motion.button 
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(239,68,68,0.1)" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={async () => {
                                  try {
                                    await apiDeleteReservation(booking.id);
                                    if (user) setBookings(await apiFetchReservations(user.id));
                                  } catch (err) {
                                    alert(err instanceof Error ? err.message : 'Erro ao cancelar');
                                  }
                                }}
                                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest p-2 rounded-xl"
                              >
                                Cancelar
                              </motion.button>
                            </td>
                          </tr>
                        );
                      })}
                      {bookings.filter(b => b.userId === user?.id).length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-12 text-center text-muted italic">
                            Você ainda não possui nenhuma reserva realizada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Configurações</h2>
                <p className="text-muted">Gerencie seu perfil e preferências do sistema.</p>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <UserCircle className="w-5 h-5" />
                    Perfil do Usuário
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row items-start gap-8 mb-8">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-3xl bg-black/5 flex items-center justify-center overflow-hidden border border-black/5">
                        {user?.photoUrl ? (
                          <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <UserIcon className="w-12 h-12 text-muted" />
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                        <Camera className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5 block">Nome Completo</label>
                        <input 
                          type="text" 
                          value={user?.name}
                          onChange={(e) => user && setUser({ ...user, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#f9f9f9] border border-black/5 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5 block">URL da Foto de Perfil</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="https://exemplo.com/foto.jpg"
                            value={user?.photoUrl || ''}
                            onChange={(e) => user && setUser({ ...user, photoUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[#f9f9f9] border border-black/5 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5 block">Matrícula</label>
                        <input
                          type="text"
                          disabled
                          value={user?.matricula ?? ''}
                          className="w-full px-4 py-3 rounded-xl bg-[#f9f9f9] border border-black/5 opacity-50 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Preferências do Sistema
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#f9f9f9] rounded-2xl border border-black/5">
                      <div>
                        <p className="text-sm font-semibold">Notificações por E-mail</p>
                        <p className="text-xs text-muted">Receba alertas sobre suas reservas.</p>
                      </div>
                      <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-[#f9f9f9] rounded-2xl border border-black/5">
                      <div>
                        <p className="text-sm font-semibold">Modo Escuro</p>
                        <p className="text-xs text-muted">Ajuste a aparência do sistema.</p>
                      </div>
                      <div className="w-12 h-6 bg-black/10 rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                <CalendarIcon className="text-white w-3 h-3" />
              </div>
              <span className="font-bold text-lg tracking-tight">SmartReserve</span>
            </div>
          </div>
        </div>
      </footer>

      <CreateResourceModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreateResource} 
      />
    </div>
  );
}

function CreateResourceModal({ isOpen, onClose, onCreate }: { isOpen: boolean; onClose: () => void; onCreate: (r: Resource) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ResourceType>('room');
  const [startHour, setStartHour] = useState('08:00');
  const [endHour, setEndHour] = useState('18:00');
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !imageUrl) {
      alert('Por favor, preencha todos os campos e selecione uma foto.');
      return;
    }

    const newResource: Resource = {
      id: `r${Date.now()}`,
      name,
      description,
      type,
      availableHours: { start: startHour, end: endHour },
      imageUrl
    };

    onCreate(newResource);
    // Reset form
    setName('');
    setDescription('');
    setType('room');
    setStartHour('08:00');
    setEndHour('18:00');
    setImageUrl('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Novo Recurso</h2>
                <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">Foto do Recurso</label>
                  <div className="relative group">
                    <div className={cn(
                      "w-full h-40 rounded-2xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center gap-2 transition-all overflow-hidden bg-black/5",
                      imageUrl ? "border-solid border-black/20" : "hover:border-black/20"
                    )}>
                      {imageUrl ? (
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-muted" />
                          <span className="text-xs text-muted font-medium">Clique para selecionar uma foto</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">Nome do Recurso</label>
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Sala de Reunião Beta"
                    className="w-full px-4 py-3 bg-black/5 border-transparent rounded-2xl focus:bg-white focus:border-black/10 focus:ring-0 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">Descrição</label>
                  <textarea 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva as características do recurso..."
                    className="w-full px-4 py-3 bg-black/5 border-transparent rounded-2xl focus:bg-white focus:border-black/10 focus:ring-0 transition-all h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted">Tipo</label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value as ResourceType)}
                      className="w-full px-4 py-3 bg-black/5 border-transparent rounded-2xl focus:bg-white focus:border-black/10 focus:ring-0 transition-all appearance-none"
                    >
                      <option value="room">Sala</option>
                      <option value="lab">Laboratório</option>
                      <option value="equipment">Equipamento</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted">Abre às</label>
                    <input 
                      required
                      type="time" 
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                      className="w-full px-4 py-3 bg-black/5 border-transparent rounded-2xl focus:bg-white focus:border-black/10 focus:ring-0 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">Fecha às</label>
                  <input 
                    required
                    type="time" 
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="w-full px-4 py-3 bg-black/5 border-transparent rounded-2xl focus:bg-white focus:border-black/10 focus:ring-0 transition-all"
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.95)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold transition-all shadow-lg shadow-black/10 mt-4"
                >
                  Criar Recurso
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ResourceCard({ resource, bookings, onClick }: { resource: Resource; bookings: Booking[]; onClick: () => void; key?: React.Key }) {
  const Icon = resource.type === 'room' ? Building2 : resource.type === 'lab' ? Microscope : Laptop;

  // Calculate next available time
  const nextAvailable = useMemo(() => {
    const now = new Date();
    const today = startOfToday();
    const [startHour] = resource.availableHours.start.split(':').map(Number);
    const [endHour] = resource.availableHours.end.split(':').map(Number);
    
    // Start checking from current hour or opening hour, whichever is later
    let checkHour = Math.max(now.getHours(), startHour);
    
    // If it's already past closing, next available is tomorrow at opening
    if (now.getHours() >= endHour) {
      return `Amanhã às ${resource.availableHours.start}`;
    }

    // Check each hour slot
    while (checkHour < endHour) {
      const slotStart = setHours(today, checkHour);
      const isBooked = bookings.some(b => 
        b.resourceId === resource.id && 
        b.status === 'confirmed' &&
        isSameDay(b.startTime, today) &&
        b.startTime.getHours() <= checkHour &&
        b.endTime.getHours() > checkHour
      );

      if (!isBooked) {
        return `${checkHour.toString().padStart(2, '0')}:00`;
      }
      checkHour++;
    }

    return 'Sem horários hoje';
  }, [resource, bookings]);

  return (
    <motion.div 
      whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[32px] overflow-hidden border border-black/5 shadow-sm transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={resource.imageUrl} 
          alt={resource.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
            <Icon className="w-3 h-3 text-black" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-black">
              {resource.type === 'room' ? 'Sala' : resource.type === 'lab' ? 'Laboratório' : 'Equipamento'}
            </span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold mb-2 group-hover:text-black transition-colors">{resource.name}</h3>
        <p className="text-muted text-sm line-clamp-2 mb-4 leading-relaxed">{resource.description}</p>
        <div className="flex items-center justify-between pt-4 border-t border-black/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{resource.availableHours.start} - {resource.availableHours.end}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Próximo: {nextAvailable}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
