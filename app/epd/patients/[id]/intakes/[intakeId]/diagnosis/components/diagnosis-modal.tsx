'use client';

/**
 * Diagnose Modal Component
 *
 * Modal voor toevoegen en bewerken van diagnoses met ICD-10 classificatie.
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ICD10Combobox } from './icd10-combobox';
import {
  diagnosisSchema,
  diagnosisDefaults,
  type DiagnosisFormData,
  DIAGNOSIS_SEVERITIES,
  DIAGNOSIS_TYPES,
  DIAGNOSIS_STATUSES,
} from '@/lib/schemas/diagnosis';
import { createDiagnosis, updateDiagnosis, type Condition } from '../../actions';
import type { ICD10Code } from '@/lib/types/icd10';

interface DiagnosisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  intakeId: string;
  diagnosis?: Condition; // undefined = nieuw, Condition = bewerk
  onSuccess: () => void; // Callback na succesvol opslaan
}

// Status labels voor weergave
const STATUS_LABELS: Record<string, string> = {
  active: 'Actief',
  remission: 'In remissie',
  resolved: 'Opgelost',
  inactive: 'Inactief',
};

// Severity labels voor weergave
const SEVERITY_LABELS: Record<string, string> = {
  licht: 'Licht',
  matig: 'Matig',
  ernstig: 'Ernstig',
};

// Diagnose type labels
const DIAGNOSIS_TYPE_LABELS: Record<string, string> = {
  primary: 'Hoofddiagnose',
  secondary: 'Nevendiagnose',
};

export function DiagnosisModal({
  open,
  onOpenChange,
  patientId,
  intakeId,
  diagnosis,
  onSuccess,
}: DiagnosisModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedICD10Code, setSelectedICD10Code] = useState<ICD10Code | null>(null);

  const isEditMode = !!diagnosis;

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

  // Reset form wanneer modal opent/sluit of diagnosis wijzigt
  useEffect(() => {
    if (open) {
      if (diagnosis) {
        // Bewerk modus: vul form met bestaande data
        setValue('code', diagnosis.code_code || '');
        setValue('description', diagnosis.code_display || '');
        setValue('severity', (diagnosis.severity_display as 'licht' | 'matig' | 'ernstig') || 'matig');
        setValue('status', (diagnosis.clinical_status as 'active' | 'remission' | 'resolved' | 'inactive') || 'active');
        setValue('diagnosisType', diagnosis.category === 'primary-diagnosis' ? 'primary' : 'secondary');
        setValue('dsm5Reference', diagnosis.code_system === 'DSM-5' ? diagnosis.code_code || '' : '');
        setValue('notes', diagnosis.note || '');

        // Set selected ICD-10 code voor combobox
        if (diagnosis.code_code && diagnosis.code_display) {
          setSelectedICD10Code({
            code: diagnosis.code_code,
            display: diagnosis.code_display,
            keywords: [],
          });
        }
      } else {
        // Nieuw: reset naar defaults
        reset(diagnosisDefaults);
        setSelectedICD10Code(null);
      }
    } else {
      // Modal gesloten: reset
      reset(diagnosisDefaults);
      setSelectedICD10Code(null);
    }
  }, [open, diagnosis, reset, setValue]);

  const handleICD10Select = (code: ICD10Code) => {
    setSelectedICD10Code(code);
    setValue('code', code.code);
    setValue('description', code.display);
  };

  const onSubmit = async (data: DiagnosisFormData) => {
    setIsSubmitting(true);

    try {
      if (isEditMode && diagnosis) {
        // Update bestaande diagnose
        const result = await updateDiagnosis(diagnosis.id, {
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
            description: result.error || 'Er ging iets mis bij het bijwerken.',
          });
          return;
        }

        toast({
          title: 'Diagnose bijgewerkt',
          description: `${data.code} — ${data.description} is aangepast.`,
        });
      } else {
        // Create nieuwe diagnose
        await createDiagnosis({
          patientId,
          intakeId,
          code: data.code,
          description: data.description,
          severity: data.severity,
          status: data.status,
          notes: data.notes || undefined,
          diagnosisType: data.diagnosisType,
        });

        toast({
          title: 'Diagnose opgeslagen',
          description: `${data.code} — ${data.description} is toegevoegd.`,
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Opslaan mislukt',
        description: error instanceof Error ? error.message : 'Er ging iets mis bij het opslaan.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Diagnose bewerken' : 'Nieuwe diagnose'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ICD-10 Code */}
          <div className="space-y-2">
            <Label htmlFor="icd10-code">
              ICD-10 Code <span className="text-red-500">*</span>
            </Label>
            <ICD10Combobox
              value={selectedICD10Code?.code || ''}
              onSelect={handleICD10Select}
              placeholder="Zoek op code of beschrijving..."
              disabled={isSubmitting}
            />
            {errors.code && (
              <p className="text-sm text-red-600">{errors.code.message}</p>
            )}
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Ernst en Diagnose type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">
                Ernst <span className="text-red-500">*</span>
              </Label>
              <Select
                value={severity}
                onValueChange={(value) => setValue('severity', value as 'licht' | 'matig' | 'ernstig')}
                disabled={isSubmitting}
              >
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Selecteer ernst" />
                </SelectTrigger>
                <SelectContent>
                  {DIAGNOSIS_SEVERITIES.map((sev) => (
                    <SelectItem key={sev} value={sev}>
                      {SEVERITY_LABELS[sev]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.severity && (
                <p className="text-sm text-red-600">{errors.severity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Diagnose type <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-4">
                {DIAGNOSIS_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`diagnosis-type-${type}`}
                      value={type}
                      checked={diagnosisType === type}
                      onChange={(e) => setValue('diagnosisType', e.target.value as 'primary' | 'secondary')}
                      disabled={isSubmitting}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                    />
                    <Label
                      htmlFor={`diagnosis-type-${type}`}
                      className="font-normal cursor-pointer"
                    >
                      {DIAGNOSIS_TYPE_LABELS[type]}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.diagnosisType && (
                <p className="text-sm text-red-600">{errors.diagnosisType.message}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={status}
              onValueChange={(value) => setValue('status', value as 'active' | 'remission' | 'resolved' | 'inactive')}
              disabled={isSubmitting}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecteer status" />
              </SelectTrigger>
              <SelectContent>
                {DIAGNOSIS_STATUSES.map((stat) => (
                  <SelectItem key={stat} value={stat}>
                    {STATUS_LABELS[stat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          {/* DSM-5 referentie */}
          <div className="space-y-2">
            <Label htmlFor="dsm5-reference">
              DSM-5 referentie (optioneel)
            </Label>
            <Input
              id="dsm5-reference"
              {...register('dsm5Reference')}
              placeholder="bijv. Major Depressive Disorder"
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.dsm5Reference && (
              <p className="text-sm text-red-600">{errors.dsm5Reference.message}</p>
            )}
          </div>

          {/* Onderbouwing */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Onderbouwing (optioneel)
            </Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Klinische redenering..."
              rows={4}
              disabled={isSubmitting}
              maxLength={500}
            />
            <p className="text-xs text-slate-500">
              {watch('notes')?.length || 0} / 500 karakters
            </p>
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuleren
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Opslaan...' : 'Opslaan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

