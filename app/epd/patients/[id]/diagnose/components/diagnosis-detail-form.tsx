'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Stethoscope, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ICD10Combobox } from '@/app/epd/patients/[id]/intakes/[intakeId]/diagnosis/components/icd10-combobox';
import {
  diagnosisSchema,
  diagnosisDefaults,
  type DiagnosisFormData,
  DIAGNOSIS_SEVERITIES,
  DIAGNOSIS_TYPES,
  DIAGNOSIS_STATUSES,
} from '@/lib/schemas/diagnosis';
import {
  createPatientDiagnosis,
  updatePatientDiagnosis,
  deletePatientDiagnosis,
  type DiagnosisWithIntake,
  type IntakeInfo,
} from '../actions';
import type { ICD10Code } from '@/lib/types/icd10';

interface DiagnosisDetailFormProps {
  patientId: string;
  intakes: IntakeInfo[];
  diagnosis: DiagnosisWithIntake | null;
  isNew: boolean;
  onSaved: () => void;
  onDeleted: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Actief',
  remission: 'In remissie',
  resolved: 'Opgelost',
  inactive: 'Inactief',
};

const SEVERITY_LABELS: Record<string, string> = {
  licht: 'Licht',
  matig: 'Matig',
  ernstig: 'Ernstig',
};

const DIAGNOSIS_TYPE_LABELS: Record<string, string> = {
  primary: 'Hoofddiagnose',
  secondary: 'Nevendiagnose',
};

export function DiagnosisDetailForm({
  patientId,
  intakes,
  diagnosis,
  isNew,
  onSaved,
  onDeleted,
}: DiagnosisDetailFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedICD10Code, setSelectedICD10Code] = useState<ICD10Code | null>(null);
  const [selectedIntakeId, setSelectedIntakeId] = useState<string>(
    diagnosis?.encounter_id || intakes[0]?.id || ''
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DiagnosisFormData>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: diagnosisDefaults,
  });

  const diagnosisType = watch('diagnosisType');
  const severity = watch('severity');
  const status = watch('status');

  // Reset form wanneer diagnosis wijzigt
  useEffect(() => {
    if (diagnosis) {
      setValue('code', diagnosis.code_code || '');
      setValue('description', diagnosis.code_display || '');
      setValue('severity', (diagnosis.severity_display as 'licht' | 'matig' | 'ernstig') || 'matig');
      setValue('status', (diagnosis.clinical_status as 'active' | 'remission' | 'resolved' | 'inactive') || 'active');
      setValue('diagnosisType', diagnosis.category === 'primary-diagnosis' ? 'primary' : 'secondary');
      setValue('notes', diagnosis.note || '');

      if (diagnosis.code_code && diagnosis.code_display) {
        setSelectedICD10Code({
          code: diagnosis.code_code,
          display: diagnosis.code_display,
          keywords: [],
        });
      }
      setSelectedIntakeId(diagnosis.encounter_id || intakes[0]?.id || '');
    } else {
      reset(diagnosisDefaults);
      setSelectedICD10Code(null);
      setSelectedIntakeId(intakes[0]?.id || '');
    }
    setShowDeleteConfirm(false);
  }, [diagnosis, reset, setValue, intakes]);

  const handleICD10Select = (code: ICD10Code) => {
    setSelectedICD10Code(code);
    setValue('code', code.code);
    setValue('description', code.display);
  };

  const onSubmit = async (data: DiagnosisFormData) => {
    if (!selectedIntakeId) {
      toast({
        variant: 'destructive',
        title: 'Intake vereist',
        description: 'Selecteer een intake om de diagnose aan te koppelen.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isNew) {
        await createPatientDiagnosis({
          patientId,
          intakeId: selectedIntakeId,
          code: data.code,
          description: data.description,
          severity: data.severity,
          status: data.status,
          notes: data.notes || undefined,
          diagnosisType: data.diagnosisType,
        });

        toast({
          title: 'Diagnose toegevoegd',
          description: `${data.code} — ${data.description}`,
        });
      } else if (diagnosis) {
        const result = await updatePatientDiagnosis(patientId, diagnosis.id, {
          code: data.code,
          description: data.description,
          severity: data.severity,
          status: data.status,
          notes: data.notes || undefined,
          diagnosisType: data.diagnosisType,
        });

        if (!result.success) {
          toast({
            variant: 'destructive',
            title: 'Bijwerken mislukt',
            description: result.error || 'Er ging iets mis.',
          });
          return;
        }

        toast({
          title: 'Diagnose bijgewerkt',
          description: `${data.code} — ${data.description}`,
        });
      }

      onSaved();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Opslaan mislukt',
        description: error instanceof Error ? error.message : 'Er ging iets mis.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!diagnosis) return;

    setIsDeleting(true);

    try {
      const result = await deletePatientDiagnosis(patientId, diagnosis.id);

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Verwijderen mislukt',
          description: result.error || 'Er ging iets mis.',
        });
        return;
      }

      toast({
        title: 'Diagnose verwijderd',
        description: `${diagnosis.code_code} is verwijderd.`,
      });

      onDeleted();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Verwijderen mislukt',
        description: error instanceof Error ? error.message : 'Er ging iets mis.',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Empty state
  if (!isNew && !diagnosis) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <Stethoscope className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">Geen diagnose geselecteerd</h3>
        <p className="text-sm text-slate-500">
          Selecteer een diagnose uit de lijst of voeg een nieuwe toe.
        </p>
      </div>
    );
  }

  const selectedIntake = intakes.find((i) => i.id === selectedIntakeId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {isNew ? 'Nieuwe diagnose' : 'Diagnose bewerken'}
        </h3>
        {!isNew && diagnosis && (
          <p className="text-sm text-slate-500 mt-1">
            Gekoppeld aan: {diagnosis.intake?.title || diagnosis.intake?.department || 'Intake'}
          </p>
        )}
      </div>

      {/* Intake selectie (alleen bij nieuwe diagnose) */}
      {isNew && intakes.length > 0 && (
        <div className="space-y-2">
          <Label>
            Intake <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedIntakeId}
            onValueChange={setSelectedIntakeId}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecteer intake" />
            </SelectTrigger>
            <SelectContent>
              {intakes.map((intake) => (
                <SelectItem key={intake.id} value={intake.id}>
                  {intake.title || intake.department || 'Intake'}{' '}
                  {intake.start_date && `(${new Date(intake.start_date).toLocaleDateString('nl-NL')})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ICD-10 Code */}
      <div className="space-y-2">
        <Label>
          ICD-10 Code <span className="text-red-500">*</span>
        </Label>
        <ICD10Combobox
          value={selectedICD10Code?.code || ''}
          onSelect={handleICD10Select}
          placeholder="Zoek op code of beschrijving..."
          disabled={isSubmitting}
        />
        {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      {/* Ernst en Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Ernst <span className="text-red-500">*</span>
          </Label>
          <Select
            value={severity}
            onValueChange={(value) => setValue('severity', value as 'licht' | 'matig' | 'ernstig')}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecteer" />
            </SelectTrigger>
            <SelectContent>
              {DIAGNOSIS_SEVERITIES.map((sev) => (
                <SelectItem key={sev} value={sev}>
                  {SEVERITY_LABELS[sev]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.severity && <p className="text-sm text-red-600">{errors.severity.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>
            Type <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-4 pt-2">
            {DIAGNOSIS_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={type}
                  checked={diagnosisType === type}
                  onChange={(e) => setValue('diagnosisType', e.target.value as 'primary' | 'secondary')}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm">{DIAGNOSIS_TYPE_LABELS[type]}</span>
              </label>
            ))}
          </div>
          {errors.diagnosisType && <p className="text-sm text-red-600">{errors.diagnosisType.message}</p>}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>
          Status <span className="text-red-500">*</span>
        </Label>
        <Select
          value={status}
          onValueChange={(value) => setValue('status', value as 'active' | 'remission' | 'resolved' | 'inactive')}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecteer" />
          </SelectTrigger>
          <SelectContent>
            {DIAGNOSIS_STATUSES.map((stat) => (
              <SelectItem key={stat} value={stat}>
                {STATUS_LABELS[stat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && <p className="text-sm text-red-600">{errors.status.message}</p>}
      </div>

      {/* Onderbouwing */}
      <div className="space-y-2">
        <Label>Onderbouwing (optioneel)</Label>
        <Textarea
          {...register('notes')}
          placeholder="Klinische redenering..."
          rows={4}
          disabled={isSubmitting}
          maxLength={500}
        />
        <p className="text-xs text-slate-500">{watch('notes')?.length || 0} / 500 karakters</p>
        {errors.notes && <p className="text-sm text-red-600">{errors.notes.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        {!isNew && diagnosis && !showDeleteConfirm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isSubmitting || isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Verwijderen
          </Button>
        )}

        {showDeleteConfirm && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-600">Zeker weten?</span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ja, verwijder'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Annuleren
            </Button>
          </div>
        )}

        {(isNew || !showDeleteConfirm) && (
          <Button type="submit" disabled={isSubmitting} className={isNew ? 'ml-auto' : ''}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Opslaan...' : 'Opslaan'}
          </Button>
        )}
      </div>
    </form>
  );
}
