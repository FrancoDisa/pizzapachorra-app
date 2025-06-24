import { Outlet } from 'react-router';
import Layout from '@/components/Layout';

export default function PedidosLayout() {
  return (
    <Layout title="Pedidos">
      <Outlet />
    </Layout>
  );
}