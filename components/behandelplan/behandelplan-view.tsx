'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Calendar,
  Target,
  Stethoscope,
  CalendarDays,
  ClipboardCheck,
  Shield,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import type { GeneratedPlan, SmartGoal, Intervention, Sessie, Evaluatiemoment, Veiligheidsplan } from '@/lib/types/behandelplan';
import type { LifeDomainScore } from '@/lib/types/leefgebieden';
import { LeefgebiedenScoresCard } from './leefgebieden-scores';
import { LeefgebiedenBadge } from './leefgebieden-badge';
import { FHIR_STATUS_LABELS, GOAL_STATUS_LABELS, type FhirCarePlanStatus, type Behandelstructuur } from '@/lib/types/behandelplan';
import { EditableSection, ItemActions } from './editable-section';
import { BehandelstructuurForm } from './sections/behandelstructuur-form';
import { GoalForm } from './sections/goal-form';
import { InterventionForm } from './sections/intervention-form';
import { Plus } from 'lucide-react';

interface CarePlan {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'on-hold' | 'completed' | 'revoked' | 'entered-in-error' | 'unknown';
  version: number | null;
  goals: SmartGoal[] | null;
  activities: Intervention[] | null;
  behandelstructuur: GeneratedPlan['behandelstructuur'] | null;
  sessie_planning: Sessie[] | null;
  evaluatiemomenten: Evaluatiemoment[] | null;
  veiligheidsplan: Veiligheidsplan | null;
  created_at: string | null;
  published_at: string | null;
  period_start: string | null;
}

interface Intake {
  id: string;
  title: string;
  status: string;
  start_date: string;
  life_domains: LifeDomainScore[] | null;
  notes: string | null;
}

interface Condition {
  id: string;
  category: string;
  code_display: string;
  severity_code: string | null;
  severity_display: string | null;
}

interface BehandelplanViewProps {
  patientId: string;
  carePlan: CarePlan | null;
  intakes: Intake[];
  conditions: Condition[];
  onGenerate: (intakeId: string) => Promise<void>;
  onStatusChange: (status: CarePlan['status']) => Promise<void>;
  onCreateManual: (intakeId?: string) => Promise<void>;
  // Edit callbacks
  onUpdateBehandelstructuur?: (data: Behandelstructuur) => Promise<void>;
  onAddGoal?: (goal: SmartGoal) => Promise<void>;
  onUpdateGoal?: (goalId: string, goal: SmartGoal) => Promise<void>;
  onDeleteGoal?: (goalId: string) => Promise<void>;
  onAddIntervention?: (intervention: Intervention) => Promise<void>;
  onUpdateIntervention?: (interventionId: string, intervention: Intervention) => Promise<void>;
  onDeleteIntervention?: (interventionId: string) => Promise<void>;
}

export function BehandelplanView({
  carePlan,
  intakes,
  conditions,
  onGenerate,
  onStatusChange,
  onCreateManual,
  onUpdateBehandelstructuur,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddIntervention,
  onUpdateIntervention,
  onDeleteIntervention,
}: BehandelplanViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [selectedIntakeId, setSelectedIntakeId] = useState<string | null>(
    intakes[0]?.id || null
  );
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingBehandelstructuur, setEditingBehandelstructuur] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [addingGoal, setAddingGoal] = useState(false);
  const [editingInterventionId, setEditingInterventionId] = useState<string | null>(null);
  const [addingIntervention, setAddingIntervention] = useState(false);

  // Temp data for forms
  const [tempBehandelstructuur, setTempBehandelstructuur] = useState<Behandelstructuur | null>(null);
  const [tempGoal, setTempGoal] = useState<SmartGoal | null>(null);
  const [tempIntervention, setTempIntervention] = useState<Intervention | null>(null);

  const selectedIntake = intakes.find((i) => i.id === selectedIntakeId);
  const hasLifeDomains = selectedIntake?.life_domains && selectedIntake.life_domains.length > 0;
  const latestCondition = conditions[0];

  const handleGenerate = async () => {
    if (!selectedIntakeId) {
      setError('Selecteer eerst een intake');
      return;
    }

    // Leefgebieden zijn aanbevolen maar niet verplicht
    if (!hasLifeDomains) {
      // Toon waarschuwing maar blokkeer niet
      console.warn('Leefgebieden niet ingevuld - AI generatie mogelijk minder nauwkeurig');
    }

    setIsGenerating(true);
    setError(null);

    try {
      await onGenerate(selectedIntakeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManual = async () => {
    setIsCreatingManual(true);
    setError(null);

    try {
      await onCreateManual(selectedIntakeId || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
    } finally {
      setIsCreatingManual(false);
    }
  };

  // No care plan exists - show generation UI
  if (!carePlan) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Behandelplan</h2>
          <p className="text-sm text-slate-600 mt-1">
            Genereer een behandelplan op basis van de intake en diagnose
          </p>
        </div>

        {/* Context Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Intake Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Intake selecteren
              </CardTitle>
            </CardHeader>
            <CardContent>
              {intakes.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Geen intakes gevonden. Maak eerst een intake aan.
                </p>
              ) : (
                <div className="space-y-2">
                  {intakes.map((intake) => (
                    <button
                      key={intake.id}
                      onClick={() => setSelectedIntakeId(intake.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedIntakeId === intake.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{intake.title}</span>
                        <Badge variant={intake.status === 'bezig' ? 'default' : 'secondary'}>
                          {intake.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(intake.start_date).toLocaleDateString('nl-NL')}
                        {intake.life_domains && intake.life_domains.length > 0 && (
                          <span className="ml-2 text-green-600">
                            Leefgebieden ingevuld
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diagnosis Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Diagnose
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestCondition ? (
                <div className="space-y-2">
                  <p className="font-medium text-sm">{latestCondition.code_display}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{latestCondition.category}</Badge>
                    {latestCondition.severity_display && (
                      <Badge
                        variant={
                          latestCondition.severity_code?.includes('severe')
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {latestCondition.severity_display}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Geen diagnose gevonden. Voeg eerst een diagnose toe.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leefgebieden Preview */}
        {selectedIntake && hasLifeDomains && (
          <LeefgebiedenScoresCard
            scores={selectedIntake.life_domains as LifeDomainScore[]}
            title="Leefgebieden (intake)"
            showTarget={false}
          />
        )}

        {/* Create Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AI Generate Option */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="py-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <Sparkles className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      AI Genereren
                    </h3>
                    <p className="text-sm text-slate-600">
                      Automatisch SMART doelen en interventies genereren
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || isCreatingManual}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Genereren...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Genereer met AI
                    </>
                  )}
                </Button>
                {!hasLifeDomains && (
                  <p className="text-xs text-amber-600">
                    Tip: vul leefgebieden in voor betere AI resultaten
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Manual Create Option */}
          <Card className="border-slate-200">
            <CardContent className="py-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-full">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Handmatig Aanmaken
                    </h3>
                    <p className="text-sm text-slate-600">
                      Zelf doelen en interventies invoeren
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleCreateManual}
                  disabled={isGenerating || isCreatingManual}
                  variant="outline"
                  className="w-full"
                >
                  {isCreatingManual ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Aanmaken...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Handmatig Aanmaken
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    );
  }

  // Care plan exists - show plan view
  const goals = (carePlan.goals as SmartGoal[]) || [];
  const interventions = (carePlan.activities as Intervention[]) || [];
  const behandelstructuur = carePlan.behandelstructuur as GeneratedPlan['behandelstructuur'] | null;
  const sessiePlanning = (carePlan.sessie_planning as Sessie[]) || [];
  const evaluatiemomenten = (carePlan.evaluatiemomenten as Evaluatiemoment[]) || [];
  const veiligheidsplan = carePlan.veiligheidsplan as Veiligheidsplan | null;
  const statusInfo = FHIR_STATUS_LABELS[carePlan.status as FhirCarePlanStatus] || {
    label: carePlan.status,
    color: '#6b7280',
  };

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">{carePlan.title}</h2>
            <Badge style={{ backgroundColor: statusInfo.color, color: 'white' }}>
              {statusInfo.label}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {carePlan.created_at && (
              <>Aangemaakt op {new Date(carePlan.created_at).toLocaleDateString('nl-NL')}</>
            )}
            {carePlan.published_at && (
              <> &bull; Gepubliceerd op {new Date(carePlan.published_at).toLocaleDateString('nl-NL')}</>
            )}
          </p>
        </div>

        {/* Status Actions */}
        <div className="flex gap-2">
          {carePlan.status === 'draft' && (
            <Button
              onClick={() => onStatusChange('active')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Publiceren
            </Button>
          )}
          {carePlan.status === 'active' && (
            <Button variant="outline" onClick={() => onStatusChange('completed')}>
              Afronden
            </Button>
          )}
        </div>
      </div>

      {/* Behandelstructuur */}
      <EditableSection
        title="Behandelstructuur"
        icon={<Calendar className="h-4 w-4" />}
        isEditing={editingBehandelstructuur}
        onEditChange={(editing) => {
          setEditingBehandelstructuur(editing);
          if (editing) {
            setTempBehandelstructuur(behandelstructuur || {
              duur: '8 weken',
              frequentie: 'Wekelijks',
              aantalSessies: 8,
              vorm: 'Individueel',
            });
          }
        }}
        canEdit={!!onUpdateBehandelstructuur}
        onSave={async () => {
          if (tempBehandelstructuur && onUpdateBehandelstructuur) {
            await onUpdateBehandelstructuur(tempBehandelstructuur);
            setEditingBehandelstructuur(false);
          }
        }}
        onCancel={() => {
          setEditingBehandelstructuur(false);
          setTempBehandelstructuur(null);
        }}
        editForm={
          <BehandelstructuurForm
            initialData={tempBehandelstructuur}
            onChange={setTempBehandelstructuur}
          />
        }
      >
        {behandelstructuur ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase">Duur</p>
              <p className="font-medium">{behandelstructuur.duur}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Frequentie</p>
              <p className="font-medium">{behandelstructuur.frequentie}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Sessies</p>
              <p className="font-medium">{behandelstructuur.aantalSessies}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Vorm</p>
              <p className="font-medium">{behandelstructuur.vorm}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Nog geen behandelstructuur ingesteld</p>
        )}
      </EditableSection>

      {/* Goals Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                SMART Doelen ({goals.length})
              </CardTitle>
              <CardDescription>
                Behandeldoelen gekoppeld aan leefgebieden
              </CardDescription>
            </div>
            {onAddGoal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAddingGoal(true);
                  setTempGoal({
                    id: crypto.randomUUID(),
                    title: '',
                    description: '',
                    clientVersion: '',
                    lifeDomain: 'dlv',
                    priority: 'middel',
                    measurability: '',
                    timelineWeeks: 8,
                    status: 'niet_gestart',
                    progress: 0,
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nieuw doel
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Add Goal Form */}
            {addingGoal && (
              <div className="p-4 border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50/50">
                <h4 className="font-medium text-slate-900 mb-3">Nieuw doel toevoegen</h4>
                <GoalForm
                  initialData={tempGoal}
                  onChange={setTempGoal}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAddingGoal(false);
                      setTempGoal(null);
                    }}
                  >
                    Annuleren
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (tempGoal && onAddGoal) {
                        await onAddGoal(tempGoal);
                        setAddingGoal(false);
                        setTempGoal(null);
                      }
                    }}
                  >
                    Opslaan
                  </Button>
                </div>
              </div>
            )}

            {goals.map((goal) => {
              const goalStatus = GOAL_STATUS_LABELS[goal.status] || {
                label: goal.status,
                color: '#6b7280',
              };
              const isEditing = editingGoalId === goal.id;

              if (isEditing) {
                return (
                  <div
                    key={goal.id}
                    className="p-4 border-2 border-indigo-300 rounded-lg bg-indigo-50/50"
                  >
                    <GoalForm
                      initialData={tempGoal || goal}
                      onChange={setTempGoal}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingGoalId(null);
                          setTempGoal(null);
                        }}
                      >
                        Annuleren
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (tempGoal && onUpdateGoal) {
                            await onUpdateGoal(goal.id, tempGoal);
                            setEditingGoalId(null);
                            setTempGoal(null);
                          }
                        }}
                      >
                        Opslaan
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={goal.id}
                  className="p-4 border rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <LeefgebiedenBadge domain={goal.lifeDomain} size="sm" />
                        <Badge
                          variant="outline"
                          style={{ borderColor: goalStatus.color, color: goalStatus.color }}
                        >
                          {goalStatus.label}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-slate-900">{goal.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{goal.description}</p>

                      {/* Client version */}
                      {goal.clientVersion && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                          <span className="font-medium">Voor cliënt: </span>
                          {goal.clientVersion}
                        </div>
                      )}

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Voortgang</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {(onUpdateGoal || onDeleteGoal) && (
                      <ItemActions
                        onEdit={onUpdateGoal ? () => {
                          setEditingGoalId(goal.id);
                          setTempGoal(goal);
                        } : undefined}
                        onDelete={onDeleteGoal ? () => onDeleteGoal(goal.id) : undefined}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {goals.length === 0 && !addingGoal && (
              <p className="text-sm text-slate-500 text-center py-4">
                Geen doelen gevonden
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interventions Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Interventies ({interventions.length})
              </CardTitle>
              <CardDescription>
                Evidence-based behandelmethoden
              </CardDescription>
            </div>
            {onAddIntervention && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAddingIntervention(true);
                  setTempIntervention({
                    id: crypto.randomUUID(),
                    name: '',
                    description: '',
                    rationale: '',
                    linkedGoalIds: [],
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nieuwe interventie
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Add Intervention Form */}
            {addingIntervention && (
              <div className="p-4 border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50/50">
                <h4 className="font-medium text-slate-900 mb-3">Nieuwe interventie toevoegen</h4>
                <InterventionForm
                  initialData={tempIntervention}
                  goals={goals}
                  onChange={setTempIntervention}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAddingIntervention(false);
                      setTempIntervention(null);
                    }}
                  >
                    Annuleren
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (tempIntervention && onAddIntervention) {
                        await onAddIntervention(tempIntervention);
                        setAddingIntervention(false);
                        setTempIntervention(null);
                      }
                    }}
                  >
                    Opslaan
                  </Button>
                </div>
              </div>
            )}

            {interventions.map((intervention) => {
              const isEditing = editingInterventionId === intervention.id;

              if (isEditing) {
                return (
                  <div
                    key={intervention.id}
                    className="p-4 border-2 border-indigo-300 rounded-lg bg-indigo-50/50"
                  >
                    <InterventionForm
                      initialData={tempIntervention || intervention}
                      goals={goals}
                      onChange={setTempIntervention}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingInterventionId(null);
                          setTempIntervention(null);
                        }}
                      >
                        Annuleren
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (tempIntervention && onUpdateIntervention) {
                            await onUpdateIntervention(intervention.id, tempIntervention);
                            setEditingInterventionId(null);
                            setTempIntervention(null);
                          }
                        }}
                      >
                        Opslaan
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={intervention.id}
                  className="p-4 border rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{intervention.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{intervention.description}</p>
                      {intervention.rationale && (
                        <div className="mt-2 p-2 bg-slate-50 rounded text-sm text-slate-700">
                          <span className="font-medium">Rationale: </span>
                          {intervention.rationale}
                        </div>
                      )}
                      {intervention.linkedGoalIds.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <span>Gekoppeld aan:</span>
                          {intervention.linkedGoalIds.map((goalId) => {
                            const goal = goals.find((g) => g.id === goalId);
                            return goal ? (
                              <LeefgebiedenBadge
                                key={goalId}
                                domain={goal.lifeDomain}
                                size="sm"
                                showEmoji={false}
                              />
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                    {(onUpdateIntervention || onDeleteIntervention) && (
                      <ItemActions
                        onEdit={onUpdateIntervention ? () => {
                          setEditingInterventionId(intervention.id);
                          setTempIntervention(intervention);
                        } : undefined}
                        onDelete={onDeleteIntervention ? () => onDeleteIntervention(intervention.id) : undefined}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {interventions.length === 0 && !addingIntervention && (
              <p className="text-sm text-slate-500 text-center py-4">
                Geen interventies gevonden
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sessie Planning Section */}
      {sessiePlanning.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Sessie Planning ({sessiePlanning.length})
            </CardTitle>
            <CardDescription>
              Overzicht van geplande en afgeronde sessies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessiePlanning.map((sessie) => {
                const statusColors: Record<string, string> = {
                  gepland: 'bg-blue-100 text-blue-800',
                  afgerond: 'bg-green-100 text-green-800',
                  no_show: 'bg-red-100 text-red-800',
                  verzet: 'bg-amber-100 text-amber-800',
                  geannuleerd: 'bg-slate-100 text-slate-800',
                };
                return (
                  <div
                    key={sessie.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                        {sessie.nummer}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{sessie.focus}</p>
                        {sessie.datum && (
                          <p className="text-xs text-slate-500">
                            {new Date(sessie.datum).toLocaleDateString('nl-NL', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={statusColors[sessie.status] || 'bg-slate-100'}>
                      {sessie.status === 'no_show' ? 'No-show' : sessie.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluatiemomenten Section */}
      {evaluatiemomenten.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Evaluatiemomenten ({evaluatiemomenten.length})
            </CardTitle>
            <CardDescription>
              Geplande evaluaties en voortgangsmomenten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {evaluatiemomenten.map((evaluatie) => {
                const typeLabels: Record<string, { label: string; color: string }> = {
                  tussentijds: { label: 'Tussentijds', color: 'bg-blue-100 text-blue-800' },
                  eind: { label: 'Eindevaluatie', color: 'bg-green-100 text-green-800' },
                  crisis: { label: 'Crisis', color: 'bg-red-100 text-red-800' },
                };
                const statusLabels: Record<string, string> = {
                  gepland: 'Gepland',
                  afgerond: 'Afgerond',
                  overgeslagen: 'Overgeslagen',
                };
                const typeInfo = typeLabels[evaluatie.type] || { label: evaluatie.type, color: 'bg-slate-100' };
                return (
                  <div
                    key={evaluatie.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium">
                        W{evaluatie.weekNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                          <span className="text-xs text-slate-500">
                            {statusLabels[evaluatie.status] || evaluatie.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(evaluatie.plannedDate).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    {evaluatie.status === 'afgerond' && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Veiligheidsplan Section */}
      {veiligheidsplan && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-800">
              <Shield className="h-4 w-4" />
              Veiligheidsplan
            </CardTitle>
            <CardDescription>
              Crisisplan en veiligheidsafspraken
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Waarschuwingssignalen */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Waarschuwingssignalen
              </h4>
              <ul className="space-y-1">
                {veiligheidsplan.waarschuwingssignalen.map((signaal, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    {signaal}
                  </li>
                ))}
              </ul>
            </div>

            {/* Coping Strategieën */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Coping Strategieën
              </h4>
              <ul className="space-y-1">
                {veiligheidsplan.copingStrategieen.map((strategie, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {strategie}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contactpersonen */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-blue-500" />
                Noodcontacten
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {veiligheidsplan.contacten.map((contact, i) => (
                  <div key={i} className="p-2 bg-white rounded border text-sm">
                    <p className="font-medium">{contact.naam}</p>
                    <p className="text-slate-500 text-xs">{contact.rol}</p>
                    <p className="text-blue-600">{contact.telefoon}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Restricties */}
            {veiligheidsplan.restricties && veiligheidsplan.restricties.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-2">Afspraken/Restricties</h4>
                <ul className="space-y-1">
                  {veiligheidsplan.restricties.map((restrictie, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {restrictie}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
