import { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export default function Section({ title, children, className = '', headerAction }: SectionProps) {
  return (
    <section className={`bg-gray-800 rounded-lg border border-gray-700 h-full flex flex-col ${className}`}>
      {/* Header de la sección */}
      <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {headerAction && (
          <div className="text-sm text-gray-300">
            {headerAction}
          </div>
        )}
      </header>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </section>
  );
}