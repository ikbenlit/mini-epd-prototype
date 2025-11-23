'use client'

/**
 * Minimal Navigation Component
 * 
 * Fixed top navigation with logo and links.
 * Mobile-friendly with hamburger menu.
 * Adaptive styling based on scroll position (hero vs content).
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import type { NavigationContent } from '@/content/schemas/manifesto'

interface MinimalNavProps {
  content: NavigationContent
}

export function MinimalNav({ content }: MinimalNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled past hero section (approximately 100vh)
      setIsScrolled(window.scrollY > window.innerHeight * 0.8)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Close menu when clicking outside or on link
  useEffect(() => {
    if (isMenuOpen) {
      const handleClickOutside = () => setIsMenuOpen(false)
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isMenuOpen])

  // Determine nav styling based on scroll position
  // On hero: dark nav with light text, on content: light nav with dark text
  const navClasses = isScrolled
    ? 'bg-white/95 backdrop-blur-sm shadow-sm'
    : 'bg-slate-900/80 backdrop-blur-sm md:bg-white/80 md:backdrop-blur-sm'

  const logoClasses = isScrolled
    ? 'text-slate-900'
    : 'text-white md:mix-blend-difference md:text-white'

  const linkClasses = isScrolled
    ? 'text-slate-900 hover:text-slate-700'
    : 'text-white hover:text-slate-200 md:mix-blend-difference md:text-white md:hover:opacity-80'

  const menuButtonClasses = isScrolled
    ? 'text-slate-900 focus-visible:outline-slate-900'
    : 'text-white focus-visible:outline-white'

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[60] transition-colors duration-200 ${navClasses}`}
      role="navigation"
      aria-label="Hoofdnavigatie"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center h-16">
        {/* Logo */}
        <Link 
          href="/"
          className={`font-black text-xl uppercase font-sans tracking-tight leading-none transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:rounded ${logoClasses}`}
          aria-label="AI Speedrun Home"
          onClick={() => setIsMenuOpen(false)}
        >
          {content.logo}
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex gap-6 items-center" role="list">
          {content.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-semibold text-base font-sans transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:rounded ${linkClasses}`}
              role="listitem"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 -mr-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:rounded ${menuButtonClasses}`}
          onClick={(e) => {
            e.stopPropagation()
            setIsMenuOpen(!isMenuOpen)
          }}
          aria-label="Menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className={`md:hidden border-t ${
            isScrolled 
              ? 'bg-white border-slate-200' 
              : 'bg-slate-900 border-slate-800'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-4 space-y-3">
            {content.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block font-semibold text-base py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:rounded ${
                  isScrolled
                    ? 'text-slate-900 hover:text-slate-700 focus-visible:outline-slate-900'
                    : 'text-white hover:text-slate-200 focus-visible:outline-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
