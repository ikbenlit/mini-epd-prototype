'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  type Behandeldoel,
  type EmbeddedInterventie,
  type GoalStatus,
  GOAL_STATUSES,
  GOAL_STATUS_LABELS,
  createEmptyEmbeddedInterventie,
} from '@/lib/types/behandelplan';
import { type LifeDomain, LIFE_DOMAINS, LIFE_DOMAIN_META } from '@/lib/types/leefgebieden';
import { Plus, X, Sparkles, Trash2, Save } from 'lucide-react';

interface BehandeldoelFormProps {
  doel: Behandeldoel;
  onSave: (doel: Behandeldoel) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  className?: string;
}

/**
 * Inline edit form voor Behandeldoel
 * Alle velden in één uitklapbare card
 */
export function BehandeldoelForm({
  doel,
  onSave,
  onCancel,
  onDelete,
  className,
}: BehandeldoelFormProps) {
  const [formData, setFormData] = useState<Behandeldoel>(doel);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Weet je zeker dat je dit behandeldoel wilt verwijderen?')) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const updateField = <K extends keyof Behandeldoel>(
    field: K,
    value: Behandeldoel[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addInterventie = () => {
    setFormData((prev) => ({
      ...prev,
      interventies: [...prev.interventies, createEmptyEmbeddedInterventie()],
    }));
  };

  const updateInterventie = (
    index: number,
    field: keyof EmbeddedInterventie,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      interventies: prev.interventies.map((int, i) =>
        i === index ? { ...int, [field]: value } : int
      ),
    }));
  };

  const removeInterventie = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      interventies: prev.interventies.filter((_, i) => i !== index),
    }));
  };

  const isValid =
    formData.title.trim().length >= 5 &&
    formData.clientVersion.trim().length >= 5;

  return (
    <Card className={cn('border-indigo-300 shadow-md', className)}>
      <CardHeader className="p-4 pb-2 border-b bg-indigo-50/50">
        <CardTitle className="text-base font-medium text-indigo-900">
          Behandeldoel bewerken
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Doel titel */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-sm font-medium">
            Doel <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Bijv. Weer 4 dagen per week stabiel kunnen werken"
            className="text-sm"
          />
        </div>

        {/* Client versie (B1) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="clientVersion" className="text-sm font-medium">
              Cliënt-versie (B1) <span className="text-red-500">*</span>
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-indigo-600 hover:text-indigo-700"
              disabled // TODO: Implementeer AI generatie
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Genereer met AI
            </Button>
          </div>
          <Textarea
            id="clientVersion"
            value={formData.clientVersion}
            onChange={(e) => updateField('clientVersion', e.target.value)}
            placeholder="Bijv. Ik kan weer 4 dagen werken zonder veel stress"
            className="text-sm min-h-[60px] resize-none"
          />
          <p className="text-xs text-slate-500">
            Formuleer in eenvoudige taal (B1-niveau) zodat de cliënt het begrijpt.
          </p>
        </div>

        {/* Leefgebied & Periode - inline */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Leefgebied</Label>
            <Select
              value={formData.lifeDomain}
              onValueChange={(v) => updateField('lifeDomain', v as LifeDomain)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIFE_DOMAINS.map((domain) => {
                  const meta = LIFE_DOMAIN_META[domain];
                  return (
                    <SelectItem key={domain} value={domain}>
                      <span className="flex items-center gap-2">
                        <span>{meta.emoji}</span>
                        <span>{meta.shortLabel}</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Periode</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={52}
                value={formData.startWeek}
                onChange={(e) =>
                  updateField('startWeek', parseInt(e.target.value) || 1)
                }
                className="w-16 text-sm text-center"
              />
              <span className="text-slate-500 text-sm">t/m</span>
              <Input
                type="number"
                min={1}
                max={52}
                value={formData.endWeek}
                onChange={(e) =>
                  updateField('endWeek', parseInt(e.target.value) || 8)
                }
                className="w-16 text-sm text-center"
              />
              <span className="text-slate-500 text-sm">weken</span>
            </div>
          </div>
        </div>

        {/* Interventies */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Aanpak (interventies)</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addInterventie}
              className="h-7 text-xs text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-3 w-3 mr-1" />
              Toevoegen
            </Button>
          </div>

          <div className="space-y-2">
            {formData.interventies.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-2">
                Nog geen interventies toegevoegd
              </p>
            ) : (
              formData.interventies.map((int, index) => (
                <div
                  key={int.id}
                  className="flex items-start gap-2 p-2 bg-slate-50 rounded-md"
                >
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      value={int.name}
                      onChange={(e) =>
                        updateInterventie(index, 'name', e.target.value)
                      }
                      placeholder="CGT"
                      className="text-sm"
                    />
                    <Input
                      value={int.description}
                      onChange={(e) =>
                        updateInterventie(index, 'description', e.target.value)
                      }
                      placeholder="Korte beschrijving"
                      className="text-sm col-span-2"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInterventie(index)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status & Voortgang */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => updateField('status', v as GoalStatus)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOAL_STATUSES.map((status) => {
                  const info = GOAL_STATUS_LABELS[status];
                  return (
                    <SelectItem key={status} value={status}>
                      {info.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Voortgang: {formData.progress}%
            </Label>
            <Slider
              value={[formData.progress]}
              onValueChange={([v]) => updateField('progress', v)}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? 'Verwijderen...' : 'Verwijderen'}
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
            >
              Annuleren
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!isValid || isSaving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Opslaan...' : 'Opslaan'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
