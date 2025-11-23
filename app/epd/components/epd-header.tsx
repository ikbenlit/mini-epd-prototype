"use client";
import React from 'react';
import { Search } from 'lucide-react';

interface EPDHeaderProps {
  className?: string;
}

export function EPDHeader({ className = "" }: EPDHeaderProps) {
  return (
    <header className={`h-[60px] bg-white border-b border-slate-200 flex items-center px-6 ${className}`}>
      {/* Left: Logo */}
      <div className="flex items-center">
        <span className="text-base font-medium text-slate-800">Mini-ECD</span>
      </div>

      {/* Center: Empty space (patient info is shown in ClientHeader below) */}
      <div className="flex-1" />

      {/* Right: Search */}
      <div className="flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Zoek patiënt..."
            className="w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
    </header>
  );
}
