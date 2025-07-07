// Exportaciones de todos los modelos de interfaz de pedidos
export { default as Model1QuickEntry } from './Model1QuickEntry';
export { default as Model2SplitScreen } from './Model2SplitScreen';
export { default as Model3VisualGrid } from './Model3VisualGrid';
export { default as Model4CompactList } from './Model4CompactList';
export { default as Model5Wizard } from './Model5Wizard';
export { default as Model6Autocomplete } from './Model6Autocomplete';
export { default as Model7Calculator } from './Model7Calculator';
export { default as Model8Favorites } from './Model8Favorites';
export { default as Model9Modal } from './Model9Modal';
export { default as Model10Timeline } from './Model10Timeline';

// Información de los modelos para referencia
export const MODEL_INFO = {
  model1: {
    name: 'Quick Entry Dashboard',
    component: 'Model1QuickEntry',
    difficulty: 'Avanzado',
    speed: 5,
    description: 'Interfaz rápida con shortcuts para usuarios expertos'
  },
  model2: {
    name: 'Split-Screen Command Center',
    component: 'Model2SplitScreen',
    difficulty: 'Medio',
    speed: 4,
    description: 'Dos paneles optimizados con categorías inteligentes'
  },
  model3: {
    name: 'Grid de Pizzas Visuales',
    component: 'Model3VisualGrid',
    difficulty: 'Fácil',
    speed: 3,
    description: 'Interfaz visual con tarjetas grandes y colores'
  },
  model4: {
    name: 'Lista Compacta Alta Densidad',
    component: 'Model4CompactList',
    difficulty: 'Avanzado',
    speed: 5,
    description: 'Tabla completa con selección múltiple y filtros'
  },
  model5: {
    name: 'Wizard de 3 Pasos',
    component: 'Model5Wizard',
    difficulty: 'Fácil',
    speed: 2,
    description: 'Flujo guiado paso a paso con validaciones'
  },
  model6: {
    name: 'Autocompletado Inteligente',
    component: 'Model6Autocomplete',
    difficulty: 'Avanzado',
    speed: 4,
    description: 'Búsqueda universal con AI y comandos especiales'
  },
  model7: {
    name: 'Layout Tipo Calculadora',
    component: 'Model7Calculator',
    difficulty: 'Medio',
    speed: 4,
    description: 'Interfaz familiar tipo calculadora con botones numerados'
  },
  model8: {
    name: 'Dashboard de Favoritos',
    component: 'Model8Favorites',
    difficulty: 'Medio',
    speed: 5,
    description: 'Favoritos personalizables con acceso ultra-rápido'
  },
  model9: {
    name: 'Interfaz Modal/Popup',
    component: 'Model9Modal',
    difficulty: 'Fácil',
    speed: 3,
    description: 'Flujo basado en ventanas modales paso a paso'
  },
  model10: {
    name: 'Timeline Horizontal',
    component: 'Model10Timeline',
    difficulty: 'Medio',
    speed: 3,
    description: 'Progreso horizontal visual con pasos definidos'
  }
} as const;

export type ModelId = keyof typeof MODEL_INFO;