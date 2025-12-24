'use client';

/**
 * Block Container
 *
 * Wrapper for ephemeral blocks with animation, close button, and sizing.
 */

import { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { useSwiftStore } from '@/stores/swift-store';
import type { BlockSize } from '@/lib/swift/types';

interface BlockContainerProps {
  title: string;
  size?: BlockSize;
  children: ReactNode;
}

const SIZE_CLASSES: Record<BlockSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  full: 'max-w-4xl',
};

// Container animations
const containerVariants: Variants = {
  initial: { scale: 0.98, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

// Content stagger animation
const contentVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1,
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

// Close button hover animation
const closeButtonVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: 90 },
  tap: { scale: 0.95 },
};

export function BlockContainer({ title, size = 'md', children }: BlockContainerProps) {
  const { closeBlock } = useSwiftStore();

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={`w-full ${SIZE_CLASSES[size]} bg-slate-800 rounded-xl border border-slate-700 shadow-2xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="text-lg font-medium text-white"
        >
          {title}
        </motion.h2>
        <motion.button
          onClick={closeBlock}
          variants={closeButtonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Sluiten (Esc)"
          aria-label="Block sluiten"
        >
          <X size={20} />
        </motion.button>
      </div>

      {/* Content */}
      <motion.div
        variants={contentVariants}
        initial="initial"
        animate="animate"
        className="p-4"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
