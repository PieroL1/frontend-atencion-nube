/**
 * CLAIM FORM
 * Formulario para crear nuevo reclamo/sugerencia
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearClaim, TIPOS, PRIORIDADES } from '../../services/reclamos';

const ClaimForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: TIPOS.RECLAMO,
    category: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.length > 250) {
      newErrors.description = 'La descripción no puede superar los 250 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // Ya NO necesitamos obtener user ni student_id
      // El backend lo deriva del token de autenticación
      
      const payload = {
        // ❌ NO enviar student_id - el backend lo deriva del usuario autenticado
        type: formData.type,
        category: formData.category.trim(),
        priority: null, // Sin prioridad inicial - el empleado la asigna
        description: formData.description.trim(),
        state: 'Agendada', // Estado inicial
      };
      
      console.log('📦 Payload a enviar:', payload);

      const claim = await crearClaim(payload);
      
      // Redirigir al detalle del claim creado
      navigate(`/reclamos/${claim.id}`, { replace: true });
    } catch (error) {
      console.error('Error al crear reclamo:', error);
      
      // Mostrar mensaje más específico si es 403 (no es estudiante)
      if (error.response?.status === 403) {
        alert('Error: Tu usuario no está registrado como estudiante en el sistema. Contacta al administrador.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/reclamos');
  };

  const charCount = formData.description.length;
  const charLimit = 250;
  const isNearLimit = charCount > 200;
  const isOverLimit = charCount > charLimit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-coal dark:to-ink">
      {/* Header */}
      <div className="bg-white dark:bg-night border-b border-gray-200 dark:border-slate/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={handleCancel}
            className="mb-4 text-sm text-slate dark:text-slate/70 hover:text-ink dark:hover:text-slate flex items-center"
          >
            ← Volver
          </button>
          
          <h1 className="text-2xl font-bold text-ink dark:text-slate">
            Nuevo Reclamo o Sugerencia
          </h1>
          <p className="mt-1 text-sm text-slate dark:text-slate/70">
            Completa el formulario para enviar tu reclamo o sugerencia
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-night rounded-lg shadow-sm dark:shadow-slate/10 p-6">
          {/* Tipo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink dark:text-slate mb-2">
              Tipo <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: TIPOS.RECLAMO }))}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.type === TIPOS.RECLAMO
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    : 'border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate hover:border-gray-400 dark:hover:border-slate/50'
                }`}
              >
                <div className="text-2xl mb-2">⚠️</div>
                <div className="font-semibold">Reclamo</div>
                <div className="text-xs text-slate dark:text-slate/70 mt-1">
                  Reportar un problema
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: TIPOS.SUGERENCIA }))}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.type === TIPOS.SUGERENCIA
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate hover:border-gray-400 dark:hover:border-slate/50'
                }`}
              >
                <div className="text-2xl mb-2">💡</div>
                <div className="font-semibold">Sugerencia</div>
                <div className="text-xs text-slate dark:text-slate/70 mt-1">
                  Proponer una mejora
                </div>
              </button>
            </div>
          </div>

          {/* Categoría */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-ink dark:text-slate mb-2">
              Categoría <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Ej: Infraestructura, Académico, Administrativo..."
              className={`w-full rounded-md border shadow-sm bg-white dark:bg-night/50 text-ink dark:text-slate placeholder-slate/50 dark:placeholder:text-slate/50 focus:ring-primary focus:border-primary focus:bg-white dark:focus:bg-night/50 ${
                errors.category ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-slate/30'
              }`}
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-ink dark:text-slate mb-2">
              Descripción <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe tu reclamo o sugerencia de manera clara y detallada..."
              className={`w-full rounded-md border shadow-sm bg-white dark:bg-night/50 text-ink dark:text-slate placeholder-slate/50 dark:placeholder:text-slate/50 focus:ring-primary focus:border-primary focus:bg-white dark:focus:bg-night/50 ${
                errors.description || isOverLimit ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-slate/30'
              }`}
            />
            <div className="mt-1 flex justify-between items-center">
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
              <p className={`text-xs ml-auto ${isOverLimit ? 'text-red-600 dark:text-red-400' : isNearLimit ? 'text-yellow-600 dark:text-yellow-500' : 'text-slate dark:text-slate/70'}`}>
                {charCount} / {charLimit} caracteres
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-slate/30 rounded-md shadow-sm text-sm font-medium text-ink dark:text-slate bg-white dark:bg-night/50 hover:bg-gray-50 dark:hover:bg-night/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading || isOverLimit}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                'Enviar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimForm;
