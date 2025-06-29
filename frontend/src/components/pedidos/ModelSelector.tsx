import { useState } from 'react';

interface ModelInfo {
  id: string;
  name: string;
  description: string;
  features: string[];
  optimal_for: string[];
  difficulty: 'Fácil' | 'Medio' | 'Avanzado';
  speed_rating: number; // 1-5 estrellas
  icon: string;
}

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (modelId: string) => void;
}

export default function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  const [showDetails, setShowDetails] = useState(false);

  const models: ModelInfo[] = [
    {
      id: 'model1',
      name: 'Quick Entry Dashboard',
      description: 'Interfaz rápida con shortcuts de teclado para usuarios expertos',
      features: ['Shortcuts F1-F12', 'Búsqueda instantánea', 'Cantidad rápida', 'Cliente express'],
      optimal_for: ['Personal experimentado', 'Alta velocidad', 'Pedidos telefónicos'],
      difficulty: 'Avanzado',
      speed_rating: 5,
      icon: '⚡'
    },
    {
      id: 'model2', 
      name: 'Split-Screen Command Center',
      description: 'Dos paneles optimizados: menú categorizado y ticket en tiempo real',
      features: ['Panel dual', 'Categorías inteligentes', 'Autocompletado cliente', 'Vista previa'],
      optimal_for: ['Multitarea', 'Visibilidad completa', 'Flujo balanceado'],
      difficulty: 'Medio',
      speed_rating: 4,
      icon: '📱'
    },
    {
      id: 'model3',
      name: 'Grid de Pizzas Visuales', 
      description: 'Interfaz visual con tarjetas grandes y ticket deslizable',
      features: ['Cards visuales', 'Panel deslizable', 'Categorías por color', 'Botones grandes'],
      optimal_for: ['Usuarios nuevos', 'Interfaz intuitiva', 'Ambiente visual'],
      difficulty: 'Fácil',
      speed_rating: 3,
      icon: '🎨'
    },
    {
      id: 'model4',
      name: 'Lista Compacta Alta Densidad',
      description: 'Tabla completa con toda la información visible y selección múltiple',
      features: ['Vista tabla', 'Selección múltiple', 'Filtros avanzados', 'Info completa'],
      optimal_for: ['Gestión eficiente', 'Comparación rápida', 'Usuarios técnicos'],
      difficulty: 'Avanzado',
      speed_rating: 5,
      icon: '📊'
    },
    {
      id: 'model5',
      name: 'Wizard de 3 Pasos',
      description: 'Flujo guiado paso a paso con validaciones y progreso visual',
      features: ['Pasos guiados', 'Validaciones', 'Progreso visual', 'Sin errores'],
      optimal_for: ['Usuarios nuevos', 'Pedidos complejos', 'Reducir errores'],
      difficulty: 'Fácil',
      speed_rating: 2,
      icon: '🧙‍♂️'
    },
    {
      id: 'model6',
      name: 'Autocompletado Inteligente',
      description: 'Búsqueda universal con scoring inteligente y comandos especiales',
      features: ['Búsqueda universal', 'AI scoring', 'Comandos especiales', 'Predicciones'],
      optimal_for: ['Búsqueda avanzada', 'Flexibilidad máxima', 'Usuarios power'],
      difficulty: 'Avanzado',
      speed_rating: 4,
      icon: '🔍'
    },
    {
      id: 'model7',
      name: 'Layout Tipo Calculadora',
      description: 'Interfaz familiar tipo calculadora con botones numerados',
      features: ['Botones numerados', 'Display LCD', 'Memoria de productos', 'Familiar'],
      optimal_for: ['Usuarios de caja', 'Interfaz familiar', 'Velocidad con práctica'],
      difficulty: 'Medio',
      speed_rating: 4,
      icon: '🧮'
    },
    {
      id: 'model8',
      name: 'Dashboard de Favoritos',
      description: 'Favoritos personalizables con combos y acceso ultra-rápido',
      features: ['Favoritos F1-F12', 'Combos personalizados', 'Modo edición', 'Ultra velocidad'],
      optimal_for: ['Productos frecuentes', 'Personalización', 'Máxima velocidad'],
      difficulty: 'Medio',
      speed_rating: 5,
      icon: '⭐'
    },
    {
      id: 'model9',
      name: 'Interfaz Modal/Popup',
      description: 'Flujo basado en ventanas modales para proceso paso a paso',
      features: ['Ventanas modales', 'Proceso guiado', 'Focus único', 'Sin distracciones'],
      optimal_for: ['Concentración', 'Proceso estructurado', 'Pantallas pequeñas'],
      difficulty: 'Fácil',
      speed_rating: 3,
      icon: '🪟'
    },
    {
      id: 'model10',
      name: 'Timeline Horizontal',
      description: 'Progreso horizontal visual con pasos claramente definidos',
      features: ['Timeline visual', 'Pasos claros', 'Navegación libre', 'Progreso visual'],
      optimal_for: ['Proceso claro', 'Control total', 'Usuarios metodicos'],
      difficulty: 'Medio',
      speed_rating: 3,
      icon: '📈'
    }
  ];

  const currentModelInfo = models.find(m => m.id === currentModel);

  const getSpeedStars = (rating: number) => {
    return '⚡'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'text-green-400';
      case 'Medio': return 'text-yellow-400';
      case 'Avanzado': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      
      {/* Header del selector */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Selector de Modelos de Interfaz</h2>
          <p className="text-gray-400">Elige el modelo que mejor se adapte a tu estilo de trabajo</p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          {showDetails ? 'Ocultar Detalles' : 'Ver Detalles'}
        </button>
      </div>

      {/* Selector actual */}
      <div className="mb-4 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentModelInfo?.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-white">{currentModelInfo?.name}</h3>
              <p className="text-gray-400 text-sm">{currentModelInfo?.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Velocidad:</div>
            <div className="text-lg">{getSpeedStars(currentModelInfo?.speed_rating || 0)}</div>
          </div>
        </div>
      </div>

      {/* Lista de modelos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={`p-3 rounded-lg transition-all text-left ${
              currentModel === model.id
                ? 'bg-blue-600 border-2 border-blue-400'
                : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
            }`}
          >
            <div className="text-center mb-2">
              <div className="text-2xl mb-1">{model.icon}</div>
              <div className="text-white font-medium text-sm">{model.name}</div>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="text-center">
                <span className={getDifficultyColor(model.difficulty)}>{model.difficulty}</span>
              </div>
              <div className="text-center">
                {getSpeedStars(model.speed_rating)}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detalles expandidos */}
      {showDetails && currentModelInfo && (
        <div className="mt-6 bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div>
              <h4 className="text-white font-medium mb-2">🔧 Características</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                {currentModelInfo.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">🎯 Óptimo Para</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                {currentModelInfo.optimal_for.map((use, index) => (
                  <li key={index}>• {use}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">📊 Métricas</h4>
              <div className="text-sm text-gray-300 space-y-2">
                <div>
                  <span className="text-gray-400">Dificultad: </span>
                  <span className={getDifficultyColor(currentModelInfo.difficulty)}>
                    {currentModelInfo.difficulty}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Velocidad: </span>
                  <span>{getSpeedStars(currentModelInfo.speed_rating)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips de uso */}
      <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600/30 rounded-lg">
        <div className="text-blue-400 text-sm font-medium mb-1">💡 Recomendación</div>
        <div className="text-blue-200 text-sm">
          {currentModelInfo?.difficulty === 'Fácil' && 
            'Perfecto para comenzar. Interfaz intuitiva que no requiere memorizar shortcuts.'}
          {currentModelInfo?.difficulty === 'Medio' && 
            'Balance entre velocidad e intuitividad. Ideal cuando ya tienes algo de experiencia.'}
          {currentModelInfo?.difficulty === 'Avanzado' && 
            'Máxima velocidad para usuarios expertos. Requiere memorizar shortcuts pero es el más eficiente.'}
        </div>
      </div>
    </div>
  );
}