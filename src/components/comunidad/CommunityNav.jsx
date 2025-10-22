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
    <div className="bg-white shadow-sm border-b mb-6">
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
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
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
