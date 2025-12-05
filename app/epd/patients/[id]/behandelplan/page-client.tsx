'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BehandelplanView, BehandelplanList } from '@/components/behandelplan';
import {
  createCarePlan,
  updateCarePlanStatus,
  createEmptyCarePlan,
  updateBehandelstructuur,
  addGoal,
  updateGoal,
  deleteGoal,
  addIntervention,
  updateIntervention,
  deleteIntervention,
} from './actions';
import type { GeneratedPlan, SmartGoal, Intervention, Sessie, Evaluatiemoment, Veiligheidsplan, Behandelstructuur } from '@/lib/types/behandelplan';
import type { LifeDomainScore } from '@/lib/types/leefgebieden';
import type { Json } from '@/lib/supabase/database.types';

// Database row types (what we get from Supabase)
interface DbCarePlan {
  id: string;
  title: string;
  status: string;
  version: number | null;
  goals: Json | null;
  activities: Json | null;
  behandelstructuur: Json | null;
  sessie_planning: Json | null;
  evaluatiemomenten: Json | null;
  veiligheidsplan: Json | null;
  created_at: string | null;
  published_at: string | null;
  period_start: string | null;
}

interface DbIntake {
  id: string;
  title: string;
  status: string;
  start_date: string;
  life_domains: Json | null;
  notes: string | null;
}

interface DbCondition {
  id: string;
  category: string;
  code_display: string;
  severity_code: string | null;
  severity_display: string | null;
}

// Mapped types for the view component
interface ViewCarePlan {
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

interface ViewIntake {
  id: string;
  title: string;
  status: string;
  start_date: string;
  life_domains: LifeDomainScore[] | null;
  notes: string | null;
}

interface ViewCondition {
  id: string;
  category: string;
  code_display: string;
  severity_code: string | null;
  severity_display: string | null;
}

interface BehandelplanPageClientProps {
  patientId: string;
  allPlans: DbCarePlan[];
  intakes: DbIntake[];
  conditions: DbCondition[];
}

// Helper to map database types to view types
function mapCarePlan(dbPlan: DbCarePlan | null): ViewCarePlan | null {
  if (!dbPlan) return null;
  return {
    ...dbPlan,
    status: dbPlan.status as ViewCarePlan['status'],
    goals: dbPlan.goals as SmartGoal[] | null,
    activities: dbPlan.activities as Intervention[] | null,
    behandelstructuur: dbPlan.behandelstructuur as GeneratedPlan['behandelstructuur'] | null,
    sessie_planning: dbPlan.sessie_planning as Sessie[] | null,
    evaluatiemomenten: dbPlan.evaluatiemomenten as Evaluatiemoment[] | null,
    veiligheidsplan: dbPlan.veiligheidsplan as Veiligheidsplan | null,
  };
}

function mapIntakes(dbIntakes: DbIntake[]): ViewIntake[] {
  return dbIntakes.map((intake) => ({
    ...intake,
    life_domains: intake.life_domains as LifeDomainScore[] | null,
  }));
}

export function BehandelplanPageClient({
  patientId,
  allPlans: initialPlans,
  intakes,
  conditions,
}: BehandelplanPageClientProps) {
  const router = useRouter();

  // State voor alle plannen en selectie
  const [plans, setPlans] = useState<DbCarePlan[]>(initialPlans);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    // Selecteer standaard het nieuwste actieve/draft plan, of het eerste plan
    initialPlans.find(p => p.status === 'active')?.id ||
    initialPlans.find(p => p.status === 'draft')?.id ||
    initialPlans[0]?.id ||
    null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showCreateView, setShowCreateView] = useState(false);

  // Geselecteerd plan
  const selectedPlan = useMemo(() => {
    const plan = plans.find(p => p.id === selectedPlanId);
    return plan ? mapCarePlan(plan) : null;
  }, [plans, selectedPlanId]);

  // Handler voor plan selectie
  const handleSelectPlan = useCallback((planId: string) => {
    setSelectedPlanId(planId);
    setShowCreateView(false);
  }, []);

  // Handler voor nieuw plan aanmaken (toont create view)
  const handleShowCreateView = useCallback(() => {
    setSelectedPlanId(null);
    setShowCreateView(true);
  }, []);

  const handleGenerate = useCallback(
    async (intakeId: string) => {
      // Get the first condition if available
      const conditionId = conditions[0]?.id;

      // Call the generate API
      const response = await fetch('/api/behandelplan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          intakeId,
          conditionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Er ging iets mis bij het genereren');
      }

      const generatedPlan: GeneratedPlan = await response.json();

      // Save to database via server action
      const savedPlan = await createCarePlan(patientId, intakeId, generatedPlan);

      // Update plans list en selecteer het nieuwe plan
      const newPlan = savedPlan as DbCarePlan;
      setPlans(prev => [newPlan, ...prev]);
      setSelectedPlanId(newPlan.id);
      setShowCreateView(false);

      // Revalidate the page
      router.refresh();
    },
    [patientId, conditions, router]
  );

  const handleStatusChange = useCallback(
    async (status: ViewCarePlan['status']) => {
      if (!selectedPlan) return;

      // Only allow valid status transitions
      if (!['draft', 'active', 'on-hold', 'completed', 'revoked'].includes(status)) {
        throw new Error('Ongeldige status');
      }

      await updateCarePlanStatus(
        selectedPlan.id,
        patientId,
        status as 'draft' | 'active' | 'on-hold' | 'completed' | 'revoked'
      );

      // Update plans list
      setPlans(prev => prev.map(p =>
        p.id === selectedPlan.id
          ? {
              ...p,
              status,
              published_at: status === 'active' ? new Date().toISOString() : p.published_at
            }
          : p
      ));

      // Revalidate
      router.refresh();
    },
    [selectedPlan, patientId, router]
  );

  const handleCreateManual = useCallback(
    async (intakeId?: string) => {
      setIsCreatingNew(true);
      try {
        // Create empty care plan via server action
        const savedPlan = await createEmptyCarePlan(patientId, intakeId);

        // Update plans list en selecteer het nieuwe plan
        const newPlan = savedPlan as DbCarePlan;
        setPlans(prev => [newPlan, ...prev]);
        setSelectedPlanId(newPlan.id);
        setShowCreateView(false);

        // Revalidate the page
        router.refresh();
      } finally {
        setIsCreatingNew(false);
      }
    },
    [patientId, router]
  );

  // =============================================================================
  // EDIT HANDLERS
  // =============================================================================

  const handleUpdateBehandelstructuur = useCallback(
    async (data: Behandelstructuur) => {
      if (!selectedPlan) return;

      await updateBehandelstructuur(selectedPlan.id, patientId, data);

      // Update local state
      setPlans(prev => prev.map(p =>
        p.id === selectedPlan.id
          ? { ...p, behandelstructuur: data as unknown as Json }
          : p
      ));

      router.refresh();
    },
    [selectedPlan, patientId, router]
  );

  const handleAddGoal = useCallback(
    async (goal: SmartGoal) => {
      if (!selectedPlan) return;

      await addGoal(selectedPlan.id, patientId, goal);

      // Update local state
      setPlans(prev => prev.map(p => {
        if (p.id !== selectedPlan.id) return p;
        const currentGoals = (p.goals as unknown as SmartGoal[]) || [];
        return { ...p, goals: [...currentGoals, goal] as unknown as Json };
      }));

      router.refresh();
    },
    [selectedPlan, patientId, router]
  );

  const handleUpdateGoal = useCallback(
    async (goalId: string, updatedGoal: SmartGoal) => {
      if (!selectedPlan) return;

      await updateGoal(selectedPlan.id, patientId, goalId, updatedGoal);

      // Update local state
      setPlans(prev => prev.map(p => {
        if (p.id !== selectedPlan.id) return p;
        const currentGoals = (p.goals as unknown as SmartGoal[]) || [];
        const newGoals = currentGoals.map(g => g.id === goalId ? updatedGoal : g);
        return { ...p, goals: newGoals as unknown as Json };
      }));

      router.refresh();
    },
    [selectedPlan, patientId, router]
  );

  const handleDeleteGoal = useCallback(
    async (goalId: string) => {
      if (!selectedPlan) return;

      await deleteGoal(selectedPlan.id, patientId, goalId);

      // Update local state
      setPlans(prev => prev.map(p => {
        if (p.id !== selectedPlan.id) return p;
        const currentGoals = (p.goals as unknown as SmartGoal[]) || [];
        const newGoals = currentGoals.filter(g => g.id !== goalId);
        return { ...p, goals: newGoals as unknown as Json };
      }));

      router.refresh();
    },
    [selectedPlan, patientId, router]
  );

  const handleAddIntervention = useCallback(
    async (intervention: Intervention) => {
      if (!selectedPlan) return;

      await addIntervention(selectedPlan.id, patientId, intervention);

      // Update local state
      setPlans(prev => prev.map(p => {
        if (p.id !== selectedPlan.id) return p;
        const currentInterventions = (p.activities as unknown as Intervention[]) || [];
        return { ...p, activities: [...currentInterventions, intervention] as unknown as Json };
      }));

      router.refresh();
    },
    [selectedPlan, patientId, router]
  );

  const handleUpdateIntervention = useCallback(
    async (interventionId: string, updatedIntervention: Intervention) => {
      if (!selectedPlan) return;

      await updateIntervention(selectedPlan.id, patientId, interventionId, updatedIntervention);

      // Update local state
      setPlans(prev => prev.map(p => {
        if (p.id !== selectedPlan.id) return p;
        const currentInterventions = (p.activities as unknown as Intervention[]) || [];
        const newInterventions = currentInterventions.map(i => i.id === interventionId ? updatedIntervention : i);
        return { ...p, activities: newInterventions as unknown as Json };
      }));

      router.refresh();
    },
    [selectedPlan, patientId, router]
  );

  const handleDeleteIntervention = useCallback(
    async (interventionId: string) => {
      if (!selectedPlan) return;

      await deleteIntervention(selectedPlan.id, patientId, interventionId);

      // Update local state
      setPlans(prev => prev.map(p => {
        if (p.id !== selectedPlan.id) return p;
        const currentInterventions = (p.activities as unknown as Intervention[]) || [];
        const newInterventions = currentInterventions.filter(i => i.id !== interventionId);
        return { ...p, activities: newInterventions as unknown as Json };
      }));

      router.refresh();
    },
    [selectedPlan, patientId, router]
  );

  return (
    <div className="space-y-6">
      {/* Plannen overzicht */}
      <BehandelplanList
        plans={plans.map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          version: p.version,
          created_at: p.created_at,
          published_at: p.published_at,
        }))}
        selectedPlanId={showCreateView ? null : selectedPlanId}
        onSelectPlan={handleSelectPlan}
        onCreateNew={handleShowCreateView}
        isCreating={isCreatingNew}
      />

      {/* Geselecteerd plan of create view */}
      <BehandelplanView
        patientId={patientId}
        carePlan={showCreateView ? null : selectedPlan}
        intakes={mapIntakes(intakes)}
        conditions={conditions}
        onGenerate={handleGenerate}
        onStatusChange={handleStatusChange}
        onCreateManual={handleCreateManual}
        onUpdateBehandelstructuur={handleUpdateBehandelstructuur}
        onAddGoal={handleAddGoal}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
        onAddIntervention={handleAddIntervention}
        onUpdateIntervention={handleUpdateIntervention}
        onDeleteIntervention={handleDeleteIntervention}
      />
    </div>
  );
}
