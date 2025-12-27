'use client';

/**
 * Artifact Container Component
 *
 * Container die meerdere artifacts kan beheren met tabs.
 * Max 3 artifacts tegelijk, tabs alleen zichtbaar bij >1 artifact.
 *
 * Epic: E4 (Artifact Area & Tabs)
 * Story: E4.S1 (ArtifactContainer component)
 */

import { ArtifactTab } from './artifact-tab';
import { DagnotatieBlock } from '../blocks/dagnotitie-block';
import { ZoekenBlock } from '../blocks/zoeken-block';
import { OverdrachtBlock } from '../blocks/overdracht-block';
import { FallbackPicker } from '../blocks/fallback-picker';
import type { Artifact, BlockType } from '@/stores/swift-store';

interface ArtifactContainerProps {
  artifacts: Artifact[];
  activeArtifactId: string | null;
  onSelectArtifact: (id: string) => void;
  onCloseArtifact: (id: string) => void;
}

/**
 * Render the appropriate block component based on artifact type
 */
function renderArtifactBlock(artifact: Artifact) {
  switch (artifact.type) {
    case 'dagnotitie':
      return <DagnotatieBlock key={artifact.id} />;
    case 'zoeken':
      return <ZoekenBlock key={artifact.id} />;
    case 'overdracht':
      return <OverdrachtBlock key={artifact.id} />;
    case 'fallback':
      return <FallbackPicker key={artifact.id} />;
    default:
      return (
        <div className="p-4 text-slate-500">
          Onbekend artifact type: {artifact.type}
        </div>
      );
  }
}

/**
 * Get user-friendly title for artifact type
 */
export function getArtifactTitle(type: BlockType, prefill?: any): string {
  switch (type) {
    case 'dagnotitie':
      return prefill?.patientName
        ? `Dagnotitie - ${prefill.patientName}`
        : 'Dagnotitie';
    case 'zoeken':
      return 'Patiënt Zoeken';
    case 'overdracht':
      return 'Dienst Overdracht';
    case 'fallback':
      return 'Kies een actie';
    default:
      return 'Artifact';
  }
}

export function ArtifactContainer({
  artifacts,
  activeArtifactId,
  onSelectArtifact,
  onCloseArtifact,
}: ArtifactContainerProps) {
  // Find active artifact
  const activeArtifact = artifacts.find((a) => a.id === activeArtifactId);

  // Show placeholder if no artifacts
  if (artifacts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-lg text-center text-slate-500">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-slate-700 mb-3">
            Artifacts verschijnen hier
          </h3>
          <p className="text-sm">
            Vraag me iets in de chat om te beginnen!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Tabs - alleen tonen bij >1 artifact */}
      {artifacts.length > 1 && (
        <div className="flex bg-white border-b border-slate-200">
          {artifacts.map((artifact) => (
            <ArtifactTab
              key={artifact.id}
              artifact={artifact}
              isActive={artifact.id === activeArtifactId}
              onSelect={onSelectArtifact}
              onClose={onCloseArtifact}
            />
          ))}
        </div>
      )}

      {/* Active artifact content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        {activeArtifact ? (
          <div key={activeArtifact.id} className="artifact-enter w-full">
            {renderArtifactBlock(activeArtifact)}
          </div>
        ) : (
          <div className="text-slate-500">
            Selecteer een artifact om te bekijken
          </div>
        )}
      </div>
    </div>
  );
}
