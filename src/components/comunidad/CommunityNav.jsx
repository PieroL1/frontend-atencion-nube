// src/components/comunidad/CommunityNav.jsx
import { useNavigate, useLocation } from 'react-router-dom';

export default function CommunityNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'Foros', path: '/comunidad/foros', icon: '💬' },
    { name: 'Eventos', path: '/comunidad/eventos', icon: '📅' },
    { name: 'Chat', path: '/comunidad/chat', icon: '💭' },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-white dark:bg-night shadow-sm border-b border-gray-200 dark:border-slate/20 mb-6">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`
                px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                ${
                  isActive(tab.path)
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate dark:text-slate/70 hover:text-ink dark:hover:text-slate hover:border-gray-300 dark:hover:border-slate/40'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
