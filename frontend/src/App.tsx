import { Outlet } from 'react-router-dom';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-amber-50 font-sans antialiased">
      <Outlet />
    </div>
  );
}

export default App;