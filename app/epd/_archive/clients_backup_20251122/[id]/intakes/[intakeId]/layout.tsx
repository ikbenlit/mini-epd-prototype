import { getIntakeById } from '../actions';
import { IntakeHeader } from './components/intake-header';
import { IntakeTabs } from './components/intake-tabs';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

interface IntakeLayoutProps {
    children: ReactNode;
    params: Promise<{ id: string; intakeId: string }>;
}

export default async function IntakeLayout({ children, params }: IntakeLayoutProps) {
    const { id, intakeId } = await params;
    const intake = await getIntakeById(intakeId);

    if (!intake) {
        notFound();
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <IntakeHeader intake={intake} />
            <IntakeTabs clientId={id} intakeId={intakeId} />
            <div className="flex-1 p-6 overflow-auto">
                {children}
            </div>
        </div>
    );
}
