import { useState } from 'react';
import { useAudioNotifications } from '@/hooks';

interface AudioSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AudioSettings({ isOpen, onClose }: AudioSettingsProps) {
  const {
    audioSettings,
    kitchenSettings,
    updateVolume,
    toggleAudio,
    updateNotificationSettings,
    testSound,
    isAudioEnabled
  } = useAudioNotifications();

  const [tempVolume, setTempVolume] = useState(kitchenSettings.volumenAudio);

  if (!isOpen) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setTempVolume(newVolume);
    updateVolume(newVolume);
  };

  const handleNotificationToggle = (type: 'nuevo_pedido' | 'cambio_estado' | 'alerta_tiempo') => {
    const setting = type === 'nuevo_pedido' ? 'nuevoPedido' : 
                    type === 'cambio_estado' ? 'cambioEstado' : 'alertaTiempo';
    updateNotificationSettings(type, !audioSettings[setting].enabled);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-amber-50">Configuración de Audio</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-amber-50 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Audio general */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-amber-50 font-medium">Audio habilitado</label>
              <button
                onClick={toggleAudio}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAudioEnabled ? 'bg-amber-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAudioEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Volumen */}
          <div>
            <label className="block text-amber-50 font-medium mb-3">
              Volumen ({tempVolume}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={tempVolume}
              onChange={handleVolumeChange}
              disabled={!isAudioEnabled}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Notificaciones específicas */}
          <div className="space-y-4">
            <h4 className="text-amber-50 font-medium">Tipos de notificación</h4>
            
            {/* Nuevo pedido */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-slate-300">Nuevo pedido</span>
                <button
                  onClick={() => testSound('nuevo_pedido')}
                  disabled={!isAudioEnabled}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-amber-50 px-2 py-1 rounded disabled:opacity-50"
                >
                  Test
                </button>
              </div>
              <button
                onClick={() => handleNotificationToggle('nuevo_pedido')}
                disabled={!isAudioEnabled}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                  audioSettings.nuevoPedido.enabled ? 'bg-amber-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    audioSettings.nuevoPedido.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Cambio estado */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-slate-300">Cambio de estado</span>
                <button
                  onClick={() => testSound('cambio_estado')}
                  disabled={!isAudioEnabled}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-amber-50 px-2 py-1 rounded disabled:opacity-50"
                >
                  Test
                </button>
              </div>
              <button
                onClick={() => handleNotificationToggle('cambio_estado')}
                disabled={!isAudioEnabled}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                  audioSettings.cambioEstado.enabled ? 'bg-amber-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    audioSettings.cambioEstado.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Alerta tiempo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-slate-300">Alerta de tiempo</span>
                <button
                  onClick={() => testSound('alerta_tiempo')}
                  disabled={!isAudioEnabled}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-amber-50 px-2 py-1 rounded disabled:opacity-50"
                >
                  Test
                </button>
              </div>
              <button
                onClick={() => handleNotificationToggle('alerta_tiempo')}
                disabled={!isAudioEnabled}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                  audioSettings.alertaTiempo.enabled ? 'bg-amber-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    audioSettings.alertaTiempo.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-amber-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}