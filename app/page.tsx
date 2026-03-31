import Dashboard from '@/components/Dashboard';

export const metadata = {
  title: 'PulseStream | Real-Time E-Commerce Analytics',
  description: 'Command Center for Live Sales & Inventory Management',
};

export default function Home() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
