'use client'

/**
 * Release Sidebar Wrapper
 *
 * Simple wrapper to avoid webpack module resolution issues
 */

import { ReleaseSidebar } from './release-sidebar'
import type { ReleaseNote, GroupMetadata, CategoryMetadata } from '@/lib/mdx/documentatie'

interface ReleaseSidebarWrapperProps {
  releases: ReleaseNote[]
  metadata: {
    groups: GroupMetadata[]
    categories: CategoryMetadata[]
  }
}

export default function ReleaseSidebarWrapper(props: ReleaseSidebarWrapperProps) {
  return <ReleaseSidebar {...props} />
}
