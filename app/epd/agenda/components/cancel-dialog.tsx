'use client';

/**
 * Cancel Appointment Confirmation Dialog
 *
 * Confirms appointment cancellation (soft delete).
 */

import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { AlertTriangle, Calendar } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  appointmentType: string;
  appointmentDate: Date;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function CancelDialog({
  open,
  onOpenChange,
  patientName,
  appointmentType,
  appointmentDate,
  onConfirm,
  isLoading,
}: CancelDialogProps) {
  const formatDateTime = (date: Date) => {
    return format(date, "EEEE d MMMM 'om' HH:mm", { locale: nl });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Afspraak annuleren
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 pt-2">
              <p>
                Weet je zeker dat je deze afspraak wilt annuleren? Deze actie kan
                niet ongedaan worden gemaakt.
              </p>

              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900">{patientName}</div>
                    <div className="text-sm text-slate-600">{appointmentType}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      {formatDateTime(appointmentDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Terug
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Annuleren...' : 'Afspraak annuleren'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
