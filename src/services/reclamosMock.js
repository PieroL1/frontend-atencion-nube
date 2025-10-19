/**
 * DATOS MOCK PARA MODO DEMO
 * Simula respuestas del backend cuando no está disponible
 */

// Simulación de BD en memoria
let mockClaims = [
  {
    id: 1,
    id_claim: 'REC-001',
    estudent_id: 1,
    student_name: 'Juan Pérez',
    type: 'Reclamo',
    category: 'Infraestructura',
    priority: null, // Sin revisar - pendiente de asignación
    description: 'El laboratorio de sistemas tiene problemas con las computadoras. Varias están sin funcionar y dificulta el trabajo en clase.',
    state: 'Agendada',
    creation_date: '2025-10-15T10:30:00Z',
    responsible_id: null,
    responsible_name: null
  },
  {
    id: 2,
    id_claim: 'SUG-001',
    estudent_id: 1,
    student_name: 'Juan Pérez',
    type: 'Sugerencia',
    category: 'Académico',
    priority: 'Media',
    description: 'Sería útil tener horarios extendidos en la biblioteca para poder estudiar en las noches previas a exámenes.',
    state: 'Realizada',
    creation_date: '2025-10-14T14:20:00Z',
    responsible_id: 3,
    responsible_name: 'Carlos López'
  },
  {
    id: 3,
    id_claim: 'REC-002',
    estudent_id: 8,
    student_name: 'Ana Martínez',
    type: 'Reclamo',
    category: 'Administrativo',
    priority: null, // Sin revisar - pendiente de asignación
    description: 'El trámite de certificados tarda mucho tiempo. Se solicitó hace 2 semanas y aún no está listo.',
    state: 'Agendada',
    creation_date: '2025-10-10T09:15:00Z',
    responsible_id: null,
    responsible_name: null
  },
  {
    id: 4,
    id_claim: 'REC-003',
    estudent_id: 9,
    student_name: 'Pedro Sánchez',
    type: 'Reclamo',
    category: 'Infraestructura',
    priority: 'Alta', // Ya revisado y priorizado
    description: 'Los baños del segundo piso están en mal estado y requieren mantenimiento urgente.',
    state: 'Agendada',
    creation_date: '2025-10-17T16:45:00Z',
    responsible_id: 2,
    responsible_name: 'María García'
  },
  {
    id: 5,
    id_claim: 'SUG-002',
    estudent_id: 1,
    student_name: 'Juan Pérez',
    type: 'Sugerencia',
    category: 'Tecnología',
    priority: null, // Sin revisar - pendiente de asignación
    description: 'Implementar una app móvil para consultar notas y horarios de forma más fácil desde el celular.',
    state: 'Agendada',
    creation_date: '2025-10-16T11:00:00Z',
    responsible_id: null,
    responsible_name: null
  }
];

let mockAssignments = [
  {
    id: 1,
    id_assignment: 'ASG-001',
    claim_id: 1,
    responsible_id: 2,
    responsible_name: 'María García',
    comments: 'Se asignó al técnico de infraestructura para revisión.',
    event_date: '2025-10-15T11:00:00Z'
  },
  {
    id: 2,
    id_assignment: 'ASG-002',
    claim_id: 1,
    responsible_id: 2,
    responsible_name: 'María García',
    comments: 'En proceso de cotización de equipos nuevos.',
    event_date: '2025-10-16T09:30:00Z'
  },
  {
    id: 3,
    id_assignment: 'ASG-003',
    claim_id: 2,
    responsible_id: 3,
    responsible_name: 'Carlos López',
    comments: 'Se aprobó la extensión de horarios. Se implementará desde la próxima semana.',
    event_date: '2025-10-15T16:00:00Z'
  },
  {
    id: 4,
    id_assignment: 'ASG-004',
    claim_id: 3,
    responsible_id: 2,
    responsible_name: 'María García',
    comments: 'Certificados entregados. Se optimizó el proceso para futuros trámites.',
    event_date: '2025-10-12T10:00:00Z'
  }
];

// Contador para IDs autoincrementales
let nextClaimId = 6;
let nextAssignmentId = 5;

/**
 * MOCK: Listar claims con filtros
 */
export const mockListarClaims = (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockClaims];

      // Aplicar filtros
      if (params.student_id) {
        filtered = filtered.filter(c => c.estudent_id === parseInt(params.student_id));
      }
      if (params.responsible_id) {
        filtered = filtered.filter(c => c.responsible_id === parseInt(params.responsible_id));
      }
      if (params.type) {
        filtered = filtered.filter(c => c.type === params.type);
      }
      if (params.category) {
        filtered = filtered.filter(c => c.category?.toLowerCase().includes(params.category.toLowerCase()));
      }
      if (params.priority) {
        // Filtro especial para "sin revisar"
        if (params.priority === 'unassigned') {
          filtered = filtered.filter(c => c.priority === null);
        } else {
          filtered = filtered.filter(c => c.priority === params.priority);
        }
      }
      if (params.state) {
        filtered = filtered.filter(c => c.state === params.state);
      }
      if (params.q) {
        const query = params.q.toLowerCase();
        filtered = filtered.filter(c => 
          c.description?.toLowerCase().includes(query) ||
          c.category?.toLowerCase().includes(query)
        );
      }
      if (params.from) {
        filtered = filtered.filter(c => new Date(c.creation_date) >= new Date(params.from));
      }
      if (params.to) {
        filtered = filtered.filter(c => new Date(c.creation_date) <= new Date(params.to));
      }

      resolve(filtered);
    }, 300); // Simula latencia de red
  });
};

/**
 * MOCK: Crear claim
 */
export const mockCrearClaim = (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newClaim = {
        id: nextClaimId++,
        id_claim: `${payload.type === 'Reclamo' ? 'REC' : 'SUG'}-${String(nextClaimId).padStart(3, '0')}`,
        estudent_id: payload.estudent_id,
        student_name: 'Dev User', // Del usuario actual
        type: payload.type,
        category: payload.category,
        priority: payload.priority,
        description: payload.description,
        state: payload.state || 'Agendada',
        creation_date: new Date().toISOString()
      };
      
      mockClaims.unshift(newClaim); // Agregar al inicio
      resolve(newClaim);
    }, 300);
  });
};

/**
 * MOCK: Obtener claim por ID
 */
export const mockGetClaim = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const claim = mockClaims.find(c => c.id === parseInt(id));
      if (claim) {
        resolve(claim);
      } else {
        reject({ response: { status: 404, data: { message: 'Claim no encontrado' } } });
      }
    }, 200);
  });
};

/**
 * MOCK: Actualizar estado de claim
 */
export const mockPatchEstadoClaim = (id, { new_state, priority, note }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const claim = mockClaims.find(c => c.id === parseInt(id));
      if (claim) {
        claim.state = new_state;
        
        // Actualizar prioridad si se proporcionó
        if (priority !== undefined) {
          claim.priority = priority;
        }
        
        // Si hay nota, crear una asignación
        if (note) {
          const assignment = {
            id: nextAssignmentId++,
            id_assignment: `ASG-${String(nextAssignmentId).padStart(3, '0')}`,
            claim_id: claim.id,
            responsible_id: 2,
            responsible_name: 'Sistema Demo',
            comments: `Estado cambiado a ${new_state}. ${note}`,
            event_date: new Date().toISOString()
          };
          mockAssignments.push(assignment);
        }
        
        resolve(claim);
      } else {
        reject({ response: { status: 404, data: { message: 'Claim no encontrado' } } });
      }
    }, 300);
  });
};

/**
 * MOCK: Listar asignaciones de un claim
 */
export const mockListarAsignaciones = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const assignments = mockAssignments.filter(a => a.claim_id === parseInt(id));
      resolve(assignments);
    }, 200);
  });
};

/**
 * MOCK: Crear asignación
 */
export const mockCrearAsignacion = (id, { responsible_id, comments }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const assignment = {
        id: nextAssignmentId++,
        id_assignment: `ASG-${String(nextAssignmentId).padStart(3, '0')}`,
        claim_id: parseInt(id),
        responsible_id,
        responsible_name: 'Sistema Demo',
        comments,
        event_date: new Date().toISOString()
      };
      
      mockAssignments.push(assignment);
      resolve(assignment);
    }, 300);
  });
};
