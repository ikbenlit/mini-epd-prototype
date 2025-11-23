import { getScreeningSummary } from './actions';
import { HelpRequestCard } from './components/help-request-card';
import { DecisionCard } from './components/decision-card';
import { ActivityLog } from './components/activity-log';
import { DocumentCard } from './components/document-card';

export default async function ScreeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const summary = await getScreeningSummary(id);
  const screening = summary.screening;

  const hasReferral = summary.documents.some(
    (doc) => doc.document_type === 'verwijsbrief'
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Screening</h2>
        <p className="text-sm text-slate-600 mt-1">
          Activiteitenlog, documenten, hulpvraag en screeningsbesluit
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HelpRequestCard
            patientId={id}
            screeningId={screening.id}
            initialValue={screening.request_for_help}
          />
          <DecisionCard
            patientId={id}
            screeningId={screening.id}
            initialDecision={screening.decision}
            initialDepartment={screening.decision_department}
            initialNotes={screening.decision_notes}
            hasReferralDocument={hasReferral}
          />
          <DocumentCard
            patientId={id}
            screeningId={screening.id}
            documents={summary.documents}
          />
        </div>

        <div className="lg:col-span-1">
          <ActivityLog
            patientId={id}
            screeningId={screening.id}
            activities={summary.activities}
          />
        </div>
      </div>
    </div>
  );
}
