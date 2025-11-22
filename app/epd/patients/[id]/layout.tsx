import { getPatient } from '../actions';
import { ClientHeader } from './components/client-header';
import { ClientSidebar } from './components/client-sidebar';

export default async function PatientDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(id);

  return (
    <div className="h-screen flex flex-col">
      {/* Client Header */}
      <ClientHeader patient={patient} />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <ClientSidebar patientId={id} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
