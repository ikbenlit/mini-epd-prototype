"use client";
import React from 'react';
import { Bell, Search } from 'lucide-react';

interface EPDHeaderProps {
  title?: string;
  subtitle?: string;
}

export function EPDHeader({ title, subtitle }: EPDHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Page Title */}
        <div className="flex-1">
          {title && (
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Search & Notifications */}
        <div className="flex items-center gap-3">
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Zoeken..."
              className="w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Notifications */}
          <button
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            aria-label="Notificaties"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
