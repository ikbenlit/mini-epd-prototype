/**
 * Feature Flags for Cortex V2
 *
 * Controls gradual rollout of new features.
 * In development, all flags default to true for testing.
 */

/** Feature flag definitions */
export const FEATURE_FLAGS = {
  /** Enable Cortex V2 architecture (Reflex + Orchestrator) */
  CORTEX_V2_ENABLED: process.env.NEXT_PUBLIC_CORTEX_V2 === 'true',

  /** Enable multi-intent detection and ActionChainCard */
  CORTEX_MULTI_INTENT: process.env.NEXT_PUBLIC_CORTEX_MULTI_INTENT === 'true',

  /** Enable proactive nudge suggestions */
  CORTEX_NUDGE: process.env.NEXT_PUBLIC_CORTEX_NUDGE === 'true',

  /** Enable classification logging (dev only) */
  CORTEX_LOGGING: process.env.NEXT_PUBLIC_CORTEX_LOGGING === 'true',
} as const;

/** Type for feature flag keys */
export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  // In development, default to true if env var not set
  if (process.env.NODE_ENV === 'development') {
    const envValue = process.env[`NEXT_PUBLIC_${flag}`];
    // Only return false if explicitly set to 'false'
    return envValue !== 'false';
  }
  return FEATURE_FLAGS[flag];
}

/**
 * Get all enabled features (useful for debugging)
 */
export function getEnabledFeatures(): FeatureFlagKey[] {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).filter(
    (flag) => isFeatureEnabled(flag)
  );
}
