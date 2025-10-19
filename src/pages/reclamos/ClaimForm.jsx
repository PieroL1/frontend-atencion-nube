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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={handleCancel}
            className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            ← Volver
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">
            Nuevo Reclamo o Sugerencia
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Completa el formulario para enviar tu reclamo o sugerencia
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {/* Tipo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: TIPOS.RECLAMO }))}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.type === TIPOS.RECLAMO
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">⚠️</div>
                <div className="font-semibold">Reclamo</div>
                <div className="text-xs text-gray-500 mt-1">
                  Reportar un problema
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: TIPOS.SUGERENCIA }))}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.type === TIPOS.SUGERENCIA
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">💡</div>
                <div className="font-semibold">Sugerencia</div>
                <div className="text-xs text-gray-500 mt-1">
                  Proponer una mejora
                </div>
              </button>
            </div>
          </div>

          {/* Categoría */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoría <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Ej: Infraestructura, Académico, Administrativo..."
              className={`w-full rounded-md shadow-sm focus:ring-[#26BBFF] focus:border-[#26BBFF] ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe tu reclamo o sugerencia de manera clara y detallada..."
              className={`w-full rounded-md shadow-sm focus:ring-[#26BBFF] focus:border-[#26BBFF] ${
                errors.description || isOverLimit ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="mt-1 flex justify-between items-center">
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
              <p className={`text-xs ml-auto ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-500'}`}>
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
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26BBFF] disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading || isOverLimit}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#26BBFF] hover:bg-[#1da9e6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26BBFF] disabled:opacity-50 disabled:cursor-not-allowed"
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
