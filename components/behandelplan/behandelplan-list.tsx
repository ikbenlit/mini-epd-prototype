'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, CheckCircle2 } from 'lucide-react';
import { FHIR_STATUS_LABELS, type FhirCarePlanStatus } from '@/lib/types/behandelplan';

interface CarePlanSummary {
  id: string;
  title: string;
  status: string;
  version: number | null;
  created_at: string | null;
  published_at: string | null;
}

interface BehandelplanListProps {
  plans: CarePlanSummary[];
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onCreateNew: () => void;
  isCreating?: boolean;
}

export function BehandelplanList({
  plans,
  selectedPlanId,
  onSelectPlan,
  onCreateNew,
  isCreating = false,
}: BehandelplanListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Behandelplannen ({plans.length})
          </CardTitle>
          <Button
            onClick={onCreateNew}
            disabled={isCreating}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nieuw
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nog geen behandelplannen aangemaakt
          </p>
        ) : (
          <div className="space-y-2">
            {plans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              const statusInfo = FHIR_STATUS_LABELS[plan.status as FhirCarePlanStatus] || {
                label: plan.status,
                color: '#6b7280',
              };
              const isActive = plan.status === 'active';

              return (
                <button
                  key={plan.id}
                  onClick={() => onSelectPlan(plan.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      <span className={`font-medium text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {plan.title}
                      </span>
                    </div>
                    <Badge
                      style={{
                        backgroundColor: statusInfo.color,
                        color: 'white',
                      }}
                      className="text-xs"
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    {plan.version && <span>v{plan.version}</span>}
                    {plan.created_at && (
                      <>
                        <span>•</span>
                        <span>
                          {new Date(plan.created_at).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </>
                    )}
                    {plan.published_at && (
                      <>
                        <span>•</span>
                        <span className="text-green-600">Gepubliceerd</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
