'use client';

/**
 * Diagnosis Manager Component
 *
 * Beheert de lijst van diagnoses met modal voor toevoegen/bewerken en cards voor weergave.
 */

import { useState, useMemo } from 'react';
import { useTransition } from 'react';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DiagnosisCard } from './diagnosis-card';
import { DiagnosisModal } from './diagnosis-modal';
import { deleteDiagnosis, type Condition } from '../../actions';
import { toast } from '@/hooks/use-toast';

interface DiagnosisManagerProps {
  patientId: string;
  intakeId: string;
  diagnoses: Condition[];
}

export function DiagnosisManager({ patientId, intakeId, diagnoses }: DiagnosisManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState<Condition | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Sorteer diagnoses: hoofddiagnoses eerst, dan op datum
  const sortedDiagnoses = useMemo(() => {
    return [...diagnoses].sort((a, b) => {
      // Hoofddiagnoses eerst
      const aIsPrimary = a.category === 'primary-diagnosis';
      const bIsPrimary = b.category === 'primary-diagnosis';
      if (aIsPrimary && !bIsPrimary) return -1;
      if (!aIsPrimary && bIsPrimary) return 1;

      // Dan op datum (nieuwste eerst)
      const aDate = a.recorded_date ? new Date(a.recorded_date).getTime() : 0;
      const bDate = b.recorded_date ? new Date(b.recorded_date).getTime() : 0;
      return bDate - aDate;
    });
  }, [diagnoses]);

  const handleNewDiagnosis = () => {
    setEditingDiagnosis(undefined);
    setModalOpen(true);
  };

  const handleEditDiagnosis = (diagnosis: Condition) => {
    setEditingDiagnosis(diagnosis);
    setModalOpen(true);
  };

  const handleDeleteClick = (diagnosisId: string) => {
    setDeletingId(diagnosisId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;

    startTransition(async () => {
      try {
        await deleteDiagnosis(patientId, intakeId, deletingId);
        toast({
          title: 'Diagnose verwijderd',
          description: 'De diagnose is succesvol verwijderd.',
        });
        setShowDeleteConfirm(false);
        setDeletingId(null);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Verwijderen mislukt',
          description: error instanceof Error ? error.message : 'Er ging iets mis bij het verwijderen.',
        });
        setDeletingId(null);
      }
    });
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    setEditingDiagnosis(undefined);
    // Toast wordt al getoond door de modal
  };

  const diagnosisToDelete = deletingId ? diagnoses.find((d) => d.id === deletingId) : null;

  return (
    <div className="space-y-4">
      {/* Header met button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Diagnoses ({diagnoses.length})
          </h3>
        </div>
        <Button onClick={handleNewDiagnosis} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe diagnose
        </Button>
      </div>

      {/* Diagnoses lijst */}
      {sortedDiagnoses.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">Nog geen diagnoses geregistreerd.</p>
          <p className="text-xs mt-1">Klik op &quot;Nieuwe diagnose&quot; om er een toe te voegen.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDiagnoses.map((diagnosis) => {
            const isPrimary = diagnosis.category === 'primary-diagnosis';
            return (
              <DiagnosisCard
                key={diagnosis.id}
                diagnosis={diagnosis}
                isPrimary={isPrimary}
                onEdit={() => handleEditDiagnosis(diagnosis)}
                onDelete={() => handleDeleteClick(diagnosis.id)}
                isDeleting={deletingId === diagnosis.id && isPending}
              />
            );
          })}
        </div>
      )}

      {/* Diagnosis Modal */}
      <DiagnosisModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        patientId={patientId}
        intakeId={intakeId}
        diagnosis={editingDiagnosis}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Diagnose verwijderen?
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-2">
                <p>
                  Weet je zeker dat je deze diagnose wilt verwijderen? Deze actie kan
                  niet ongedaan worden gemaakt.
                </p>
                {diagnosisToDelete && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <div className="font-medium text-slate-900">
                      {diagnosisToDelete.code_code} — {diagnosisToDelete.code_display}
                    </div>
                    {diagnosisToDelete.severity_display && (
                      <div className="text-sm text-slate-600 mt-1">
                        Ernst: {diagnosisToDelete.severity_display}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeletingId(null);
              }}
              disabled={isPending}
            >
              Annuleren
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verwijderen...
                </>
              ) : (
                'Verwijderen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
