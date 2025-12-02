'use client';

/**
 * Reschedule Confirmation Dialog
 *
 * Confirms appointment rescheduling after drag-and-drop.
 */

import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  appointmentType: string;
  oldStart: Date;
  oldEnd: Date | null;
  newStart: Date;
  newEnd: Date | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function RescheduleDialog({
  open,
  onOpenChange,
  patientName,
  appointmentType,
  oldStart,
  oldEnd,
  newStart,
  newEnd,
  onConfirm,
  isLoading,
}: RescheduleDialogProps) {
  const formatDateTime = (date: Date) => {
    return format(date, "EEEE d MMMM 'om' HH:mm", { locale: nl });
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            Afspraak verzetten
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 pt-2">
              <p>
                Weet je zeker dat je de afspraak van <strong>{patientName}</strong>{' '}
                ({appointmentType}) wilt verzetten?
              </p>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-center">
                    <div className="text-xs text-slate-500 mb-1">Van</div>
                    <div className="text-sm font-medium text-slate-700">
                      {formatDateTime(oldStart)}
                    </div>
                    {oldEnd && (
                      <div className="text-xs text-slate-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatTime(oldStart)} - {formatTime(oldEnd)}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-teal-600 flex-shrink-0" />
                  <div className="flex-1 text-center">
                    <div className="text-xs text-slate-500 mb-1">Naar</div>
                    <div className="text-sm font-medium text-teal-700">
                      {formatDateTime(newStart)}
                    </div>
                    {newEnd && (
                      <div className="text-xs text-slate-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatTime(newStart)} - {formatTime(newEnd)}
                      </div>
                    )}
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
            Annuleren
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Verzetten...' : 'Verzetten'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
