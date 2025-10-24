// src/components/comunidad/ModalMiembros.jsx
import { useState, useEffect } from 'react';
import { obtenerMiembrosForo, cambiarRolMiembro } from '../../services/community';
import { showToast } from '../../utils/toast';

export default function ModalMiembros({ isOpen, onClose, forumId, isOwner }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [changingRole, setChangingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && forumId) {
      loadMembers();
    }
  }, [isOpen, forumId]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await obtenerMiembrosForo(forumId);
      setMembers(data);
    } catch (error) {
      console.error('Error al cargar miembros:', error);
      showToast('Error al cargar la lista de miembros', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (studentId, currentRole) => {
    // Toggle entre Miembro y Moderador
    const newRole = currentRole === 'Moderador' ? 'Miembro' : 'Moderador';
    
    const confirmMessage = 
      newRole === 'Moderador'
        ? '¿Promover este miembro a Moderador? Podrá gestionar publicaciones.'
        : '¿Degradar este moderador a Miembro? Perderá permisos de moderación.';
    
    if (!window.confirm(confirmMessage)) return;

    setChangingRole(studentId);
    try {
      await cambiarRolMiembro(forumId, {
        student_id: studentId,
        new_role: newRole,
      });
      showToast(`Rol actualizado a ${newRole}`, 'success');
      loadMembers(); // Recargar lista
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      showToast('Error al cambiar el rol', 'error');
    } finally {
      setChangingRole(null);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      Owner: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      Moderador: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      Miembro: 'bg-gray-100 dark:bg-slate/20 text-gray-700 dark:text-slate',
    };
    return badges[role] || badges.Miembro;
  };

  const getRoleIcon = (role) => {
    const icons = {
      Owner: '👑',
      Moderador: '🛡️',
      Miembro: '👤',
    };
    return icons[role] || icons.Miembro;
  };

  // Filtrar miembros por término de búsqueda
  const filteredMembers = members.filter((member) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(search) ||
      member.email.toLowerCase().includes(search)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-night rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl dark:shadow-slate/10 border border-transparent dark:border-slate/20">
        {/* Header */}
        <div className="p-6 border-b dark:border-slate/20 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-ink dark:text-slate">
            Miembros del Foro
          </h2>
          <button
            onClick={onClose}
            className="text-slate dark:text-slate/70 hover:text-ink dark:hover:text-slate text-2xl"
          >
            ×
          </button>
        </div>

        {/* Buscador */}
        <div className="p-4 border-b dark:border-slate/20 bg-gray-50 dark:bg-night/50">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white dark:bg-night/50 border border-gray-300 dark:border-slate/30 text-ink dark:text-slate placeholder:text-gray-400 dark:placeholder:text-slate/50 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <p className="text-sm text-slate dark:text-slate/70 mt-2">
              {filteredMembers.length} de {members.length} miembros
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-slate dark:text-slate/70 mt-4">Cargando miembros...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <p className="text-center text-slate dark:text-slate/70 py-8">
              {searchTerm ? 'No se encontraron miembros con ese criterio' : 'No hay miembros en este foro'}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-night/50 rounded-lg hover:bg-gray-100 dark:hover:bg-night/70 transition border border-transparent dark:border-slate/20"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-ink dark:text-slate">{member.name}</p>
                      <p className="text-sm text-slate dark:text-slate/70">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(member.role)}`}>
                      {getRoleIcon(member.role)} {member.role}
                    </span>

                    {/* Solo el Owner puede cambiar roles, y no puede cambiar su propio rol */}
                    {isOwner && member.role !== 'Owner' && (
                      <button
                        onClick={() => handleChangeRole(member.id, member.role)}
                        disabled={changingRole === member.id}
                        className="px-3 py-1 text-sm border border-blue-600 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition disabled:opacity-50"
                      >
                        {changingRole === member.id ? (
                          'Cambiando...'
                        ) : member.role === 'Moderador' ? (
                          'Degradar'
                        ) : (
                          'Promover'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info para Owner */}
          {isOwner && !loading && members.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-transparent dark:border-blue-900/30">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                <strong>💡 Como propietario:</strong> Puedes promover miembros a moderadores 
                para que te ayuden a gestionar el foro. Los moderadores pueden aprobar/rechazar publicaciones.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-slate/20">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate/70 dark:bg-slate/30 text-white rounded-lg hover:bg-slate dark:hover:bg-slate/40 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
