'use client'

import * as React from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Whether the button is in a loading state (shows spinner)
   */
  isLoading?: boolean
  /**
   * Button variant
   * - "default": Amber gradient background (primary AI action)
   * - "outline": Outlined button with amber accent
   * - "ghost": Transparent background with amber text
   */
  variant?: "default" | "outline" | "ghost"
  /**
   * Button size
   */
  size?: "sm" | "md" | "lg"
  /**
   * Show sparkle icon
   */
  showIcon?: boolean
  /**
   * Icon position (only applies when showIcon is true)
   */
  iconPosition?: "left" | "right"
}

/**
 * AIButton Component
 *
 * A specialized button component for AI-powered actions.
 * Uses amber gradient colors to signal AI functionality.
 *
 * @example
 * ```tsx
 * <AIButton onClick={handleAISummary}>
 *   Generate Summary
 * </AIButton>
 *
 * <AIButton variant="outline" isLoading>
 *   Processing...
 * </AIButton>
 * ```
 */
const AIButton = React.forwardRef<HTMLButtonElement, AIButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      showIcon = true,
      iconPosition = "left",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variants = {
      default: cn(
        // Amber gradient background (darker for WCAG AA compliance)
        "bg-gradient-to-r from-amber-600 to-amber-700",
        "hover:from-amber-700 hover:to-amber-800",
        "active:from-amber-800 active:to-amber-900",
        "text-white shadow-md",
        // Focus states (WCAG AA compliant)
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600",
        // Disabled state
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-amber-600 disabled:hover:to-amber-700"
      ),
      outline: cn(
        "border-2 border-amber-500 bg-transparent",
        "text-amber-700 hover:bg-amber-50",
        "active:bg-amber-100",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      ),
      ghost: cn(
        "bg-transparent text-amber-700",
        "hover:bg-amber-50 hover:text-amber-800",
        "active:bg-amber-100",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      ),
    }

    // Size styles
    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-md",
      md: "px-4 py-2 text-sm rounded-md",
      lg: "px-6 py-3 text-base rounded-lg",
    }

    const Icon = isLoading ? Loader2 : Sparkles
    const iconClasses = cn(
      "h-4 w-4",
      isLoading && "animate-spin"
    )

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center gap-2",
          "font-medium transition-all duration-200",
          // Variant + Size
          variants[variant],
          sizes[size],
          // Custom className
          className
        )}
        {...props}
      >
        {showIcon && iconPosition === "left" && (
          <Icon className={iconClasses} aria-hidden="true" />
        )}
        {children}
        {showIcon && iconPosition === "right" && (
          <Icon className={iconClasses} aria-hidden="true" />
        )}
      </button>
    )
  }
)

AIButton.displayName = "AIButton"

export { AIButton }
