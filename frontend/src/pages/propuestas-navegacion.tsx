// Navegación entre las 5 propuestas de diseño
import { Link } from 'react-router';

export default function PropuestasNavegacion() {
  const propuestas = [
    {
      id: 1,
      titulo: "Dashboard Minimalista",
      descripcion: "Layout limpio con cards flotantes, paleta blanco/gris/azul",
      ruta: "/propuesta1",
      color: "from-blue-400 to-blue-600"
    },
    {
      id: 2,
      titulo: "POS Terminal Profesional", 
      descripcion: "Diseño tipo terminal de punto de venta, paleta negro/verde neón",
      ruta: "/propuesta2",
      color: "from-green-400 to-green-600"
    },
    {
      id: 3,
      titulo: "Interfaz Tipo Mobile App",
      descripcion: "Cards estilo aplicación móvil moderna con degradados",
      ruta: "/propuesta3", 
      color: "from-purple-400 to-pink-600"
    },
    {
      id: 4,
      titulo: "Dashboard Analytics",
      descripcion: "Estilo empresarial moderno con glassmorphism",
      ruta: "/propuesta4",
      color: "from-purple-600 to-blue-600"
    },
    {
      id: 5,
      titulo: "Interfaz E-commerce",
      descripcion: "Diseño como tienda online moderna, paleta cálida",
      ruta: "/propuesta5",
      color: "from-orange-400 to-amber-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Propuestas de Diseño - Interfaz de Pedidos
          </h1>
          <p className="text-gray-300 text-lg">
            5 propuestas diferentes para elegir el diseño que más te guste
          </p>
        </div>

        {/* Grid de propuestas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {propuestas.map((propuesta) => (
            <Link
              key={propuesta.id}
              to={propuesta.ruta}
              className="group block"
            >
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all transform hover:scale-105 hover:shadow-2xl">
                
                {/* Número de propuesta */}
                <div className={`w-16 h-16 bg-gradient-to-r ${propuesta.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <span className="text-white text-2xl font-bold">{propuesta.id}</span>
                </div>

                {/* Título */}
                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                  {propuesta.titulo}
                </h2>

                {/* Descripción */}
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {propuesta.descripcion}
                </p>

                {/* CTA */}
                <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                  <span className="font-medium">Ver propuesta</span>
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}

          {/* Card especial para volver al original */}
          <Link
            to="/pedidos"
            className="group block"
          >
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded-3xl p-8 hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 hover:shadow-2xl">
              
              {/* Icono original */}
              <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 4l2 2 4-4" />
                </svg>
              </div>

              {/* Título */}
              <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-gray-300 transition-colors">
                Diseño Actual
              </h2>

              {/* Descripción */}
              <p className="text-gray-400 mb-6 leading-relaxed">
                Ver el diseño actual implementado con las mejoras realizadas
              </p>

              {/* CTA */}
              <div className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                <span className="font-medium">Ver actual</span>
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Instrucciones */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-4">
            💡 Instrucciones
          </h3>
          <p className="text-gray-300 mb-4">
            Haz clic en cualquier propuesta para ver el diseño completo. Las interfaces son solo visuales para evaluación.
          </p>
          <p className="text-gray-400 text-sm">
            Una vez que elijas tu favorita, la implementaremos con toda la funcionalidad.
          </p>
        </div>

      </div>
    </div>
  );
}