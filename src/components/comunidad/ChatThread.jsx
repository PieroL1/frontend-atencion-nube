// src/components/comunidad/ChatThread.jsx
import { useState, useEffect, useRef } from 'react';
import { formatDateTime, getRelativeTime } from '../../constants/community';

export default function ChatThread({ messages, onSendMessage, currentUserId }) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-ink">
        {messages.length === 0 ? (
          <div className="text-center text-slate dark:text-slate/70 py-8">
            <p>No hay mensajes aún</p>
            <p className="text-sm mt-2">Inicia la conversación</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isMine
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-night text-ink dark:text-slate'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isMine ? 'text-white/70' : 'text-slate dark:text-slate/70'
                    }`}
                  >
                    {getRelativeTime(msg.sent_date)}
                    {isMine && msg.seen && (
                      <span className="ml-1">✓✓</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Form enviar mensaje */}
      <div className="border-t border-gray-200 dark:border-slate/20 bg-white dark:bg-night p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
