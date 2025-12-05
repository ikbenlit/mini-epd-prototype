'use client';

import { useState, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, X, Check, Loader2 } from 'lucide-react';

interface EditableSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  editForm?: ReactNode;
  onSave?: () => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
  onEditChange?: (isEditing: boolean) => void;
  canEdit?: boolean;
  className?: string;
}

export function EditableSection({
  title,
  description,
  icon,
  children,
  editForm,
  onSave,
  onCancel,
  isEditing: externalIsEditing,
  onEditChange,
  canEdit = true,
  className = '',
}: EditableSectionProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Use external or internal state
  const isEditing = externalIsEditing ?? internalIsEditing;
  const setIsEditing = onEditChange ?? setInternalIsEditing;

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setIsEditing(false);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {canEdit && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing && editForm ? (
          <div className="space-y-4">
            {editForm}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Annuleren
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Opslaan
              </Button>
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

// Simple inline edit buttons for list items
interface ItemActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function ItemActions({ onEdit, onDelete, isDeleting }: ItemActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </div>
  );
}
