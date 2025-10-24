// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-night border-t border-gray-200 dark:border-slate/20 text-center py-3 text-xs text-gray-500 dark:text-slate">
      © {new Date().getFullYear()} Universidad Nacional del Santa – Atención al Estudiante
    </footer>
  );
}
