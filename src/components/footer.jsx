// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 text-center py-3 text-xs text-gray-500">
      © {new Date().getFullYear()} Universidad Nacional del Santa – Atención al Estudiante
    </footer>
  );
}
