// src/utils/toast.js
// Utilidad simple para mostrar notificaciones temporales

let toastContainer = null;

const getOrCreateContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "fixed top-4 right-4 z-50 space-y-2";
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

const createToast = (message, type = "success") => {
  const container = getOrCreateContainer();
  const toast = document.createElement("div");

  const bgColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  };

  toast.className = `${
    bgColors[type]
  } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in max-w-md`;
  toast.innerHTML = `
    <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      ${
        type === "success"
          ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>'
          : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>'
      }
    </svg>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remover después de 3 segundos
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

export const toast = {
  success: (message) => createToast(message, "success"),
  error: (message) => createToast(message, "error"),
  info: (message) => createToast(message, "info"),
  warning: (message) => createToast(message, "warning"),
};

// Export adicional para compatibilidad
export const showToast = (message, type = "success") => {
  return createToast(message, type);
};
