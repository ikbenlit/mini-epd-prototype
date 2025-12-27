'use client';

/**
 * Artifact Area (v3.0 + E4)
 *
 * Displays artifacts using ArtifactContainer with tab support.
 * Manages multiple artifacts with lifecycle actions.
 *
 * Epic: E1 (Foundation), E3 (Chat API), E4 (Artifact Area & Tabs)
 * Stories: E1.S3, E3.S6, E4.S1, E4.S2
 */

import { useSwiftStore } from '@/stores/swift-store';
import { ArtifactContainer } from './artifact-container';

export function ArtifactArea() {
  const openArtifacts = useSwiftStore((s) => s.openArtifacts);
  const activeArtifactId = useSwiftStore((s) => s.activeArtifactId);
  const switchArtifact = useSwiftStore((s) => s.switchArtifact);
  const closeArtifact = useSwiftStore((s) => s.closeArtifact);

  return (
    <ArtifactContainer
      artifacts={openArtifacts}
      activeArtifactId={activeArtifactId}
      onSelectArtifact={switchArtifact}
      onCloseArtifact={closeArtifact}
    />
  );
}
