'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  type Behandeldoel,
  type Behandelstructuur,
  type Evaluatiemoment,
  type Veiligheidsplan,
  type SmartGoal,
  type Intervention,
  type FhirCarePlanStatus,
  FHIR_STATUS_LABELS,
  transformToFlat,
  createEmptyBehandeldoel,
  calculateBehandeldoelenProgress,
} from '@/lib/types/behandelplan';
import { type LifeDomainScore } from '@/lib/types/leefgebieden';
import { ContextHeader } from './context-header';
import { BehandeldoelCard } from './behandeldoel-card';
import { PlanningSection } from './planning-section';
import { Plus, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Condition {
  id: string;
  category: string;
  code_display: string;
  severity_code: string | null;
  severity_display: string | null;
}

interface CarePlan {
  id: string;
  title: string;
  status: FhirCarePlanStatus;
  version: number | null;
  goals: SmartGoal[] | null;
  activities: Intervention[] | null;
  behandelstructuur: Behandelstructuur | null;
  sessie_planning: unknown[] | null;
  evaluatiemomenten: Evaluatiemoment[] | null;
  veiligheidsplan: Veiligheidsplan | null;
  created_at: string | null;
  published_at: string | null;
  period_start: string | null;
}

interface BehandelplanFlatProps {
  patientId: string;
  carePlan: CarePlan | null;
  condition: Condition | null;
  hulpvraag: string | null;
  lifeDomainScores: LifeDomainScore[] | null;
  // Callbacks
  onGenerate?: () => Promise<void>;
  onCreateManual?: () => Promise<void>;
  onStatusChange?: (status: FhirCarePlanStatus) => Promise<void>;
  onSaveBehandeldoel?: (doel: Behandeldoel) => Promise<void>;
  onDeleteBehandeldoel?: (doelId: string) => Promise<void>;
  className?: string;
}

/**
 * BehandelplanFlat - Hoofdcomponent voor plat behandelplan
 *
 * 3 blokken:
 * 1. Context Header (read-only): Diagnose, hulpvraag, leefgebieden
 * 2. Behandeldoelen (editable): Cards met inline interventies
 * 3. Planning & Evaluatie (collapsed): Evaluaties, sessies, veiligheidsplan
 */
export function BehandelplanFlat({
  patientId,
  carePlan,
  condition,
  hulpvraag,
  lifeDomainScores,
  onGenerate,
  onCreateManual,
  onStatusChange,
  onSaveBehandeldoel,
  onDeleteBehandeldoel,
  className,
}: BehandelplanFlatProps) {
  const [editingDoelId, setEditingDoelId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Transform old structure to flat
  const behandeldoelen: Behandeldoel[] = carePlan?.goals && carePlan?.activities
    ? transformToFlat(carePlan.goals, carePlan.activities)
    : [];

  const totalProgress = calculateBehandeldoelenProgress(behandeldoelen);
  const statusInfo = carePlan?.status ? FHIR_STATUS_LABELS[carePlan.status] : null;

  // Handlers
  const handleGenerate = async () => {
    if (!onGenerate) return;
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManual = async () => {
    if (!onCreateManual) return;
    setIsCreating(true);
    try {
      await onCreateManual();
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveDoel = async (doel: Behandeldoel) => {
    if (!onSaveBehandeldoel) return;
    await onSaveBehandeldoel(doel);
    setEditingDoelId(null);
  };

  const handleDeleteDoel = async (doelId: string) => {
    if (!onDeleteBehandeldoel) return;
    await onDeleteBehandeldoel(doelId);
    setEditingDoelId(null);
  };

  const handleAddDoel = () => {
    const newDoel = createEmptyBehandeldoel();
    // Start editing immediately
    setEditingDoelId(newDoel.id);
    // We need to save this empty doel first, then edit
    // For now, we'll handle this in the parent component
  };

  // No plan yet - show creation options
  if (!carePlan) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Context header */}
        <ContextHeader
          condition={condition}
          hulpvraag={hulpvraag}
          lifeDomainScores={lifeDomainScores}
        />

        {/* Creation options */}
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                Nog geen behandelplan
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Maak een nieuw behandelplan aan
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? 'Genereren...' : 'Genereer met AI'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateManual}
                disabled={isCreating}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Aanmaken...' : 'Handmatig aanmaken'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Plan header with status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {carePlan.title || 'Behandelplan'}
          </h2>
          {statusInfo && (
            <Badge
              variant="outline"
              style={{ borderColor: statusInfo.color, color: statusInfo.color }}
            >
              {statusInfo.label}
            </Badge>
          )}
          {carePlan.version && (
            <span className="text-sm text-slate-500">v{carePlan.version}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Overall progress */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Voortgang:</span>
            <div className="w-24">
              <Progress value={totalProgress} className="h-2" />
            </div>
            <span className="font-medium">{totalProgress}%</span>
          </div>
          {/* Status actions */}
          {carePlan.status === 'draft' && onStatusChange && (
            <Button
              size="sm"
              onClick={() => onStatusChange('active')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Activeren
            </Button>
          )}
        </div>
      </div>

      {/* Block 1: Context Header */}
      <ContextHeader
        condition={condition}
        hulpvraag={hulpvraag}
        lifeDomainScores={lifeDomainScores}
      />

      {/* Block 2: Behandeldoelen */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">
            Behandeldoelen ({behandeldoelen.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddDoel}
            className="text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nieuw doel
          </Button>
        </div>

        {behandeldoelen.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-slate-500">
                Nog geen behandeldoelen. Klik op &quot;Nieuw doel&quot; om te beginnen.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {behandeldoelen.map((doel) => (
              <BehandeldoelCard
                key={doel.id}
                doel={doel}
                isEditing={editingDoelId === doel.id}
                onEdit={() => setEditingDoelId(doel.id)}
                onSave={handleSaveDoel}
                onCancel={() => setEditingDoelId(null)}
                onDelete={() => handleDeleteDoel(doel.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Block 3: Planning & Evaluatie */}
      <PlanningSection
        behandelstructuur={carePlan.behandelstructuur}
        evaluatiemomenten={carePlan.evaluatiemomenten}
        veiligheidsplan={carePlan.veiligheidsplan}
      />
    </div>
  );
}
