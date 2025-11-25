"use client";
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  LayoutDashboard,
  User,
  ClipboardList,
  Stethoscope,
  Calendar,
  FileBarChart
} from 'lucide-react';

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
}

interface EPDSidebarProps {
  className?: string;
  userEmail?: string;
  userName?: string;
}

// LEVEL 1: Behandelaar Context Navigation
const level1NavigationItems: NavigationItem[] = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, href: "/epd/dashboard" },
  { id: "clients", name: "Cliënten", icon: Users, href: "/epd/patients" },
  { id: "agenda", name: "Agenda", icon: FileText, href: "/epd/agenda" },
  { id: "reports", name: "Rapportage", icon: Settings, href: "/epd/reports" },
];

// LEVEL 2: Client Dossier Context Navigation (clientId gets injected)
const level2NavigationItems: NavigationItem[] = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, href: "" },
  { id: "basisgegevens", name: "Basisgegevens", icon: User, href: "/basisgegevens" },
  { id: "screening", name: "Screening", icon: ClipboardList, href: "/screening" },
  { id: "intake", name: "Intake", icon: FileText, href: "/intakes" },
  { id: "diagnose", name: "Diagnose", icon: Stethoscope, href: "/diagnose" },
  { id: "behandelplan", name: "Behandelplan", icon: Calendar, href: "/behandelplan" },
  { id: "rapportage", name: "Rapportage", icon: FileBarChart, href: "/rapportage" },
];

// Memoized sidebar item component to prevent unnecessary re-renders
interface SidebarItemProps {
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const SidebarItem = memo(function SidebarItem({ item, isActive, isCollapsed, onClick }: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-200 group",
          isActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
          isCollapsed && "justify-center px-2"
        )}
        title={isCollapsed ? item.name : undefined}
      >
        <div className="flex items-center justify-center min-w-[20px]">
          <Icon
            className={cn(
              "h-5 w-5 flex-shrink-0",
              isActive
                ? "text-slate-700"
                : "text-slate-500 group-hover:text-slate-700"
            )}
          />
        </div>

        {!isCollapsed && (
          <div className="flex items-center justify-between w-full">
            <span className={cn("text-sm", isActive ? "font-medium" : "font-normal")}>
              {item.name}
            </span>
            {item.badge && (
              <span className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                isActive
                  ? "bg-slate-200 text-slate-700"
                  : "bg-slate-100 text-slate-600"
              )}>
                {item.badge}
              </span>
            )}
          </div>
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
            {item.name}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-800 rotate-45" />
          </div>
        )}
      </Link>
    </li>
  );
}, (prev, next) => {
  // Custom comparison - only re-render if these props change
  return prev.item.href === next.item.href &&
         prev.isActive === next.isActive &&
         prev.isCollapsed === next.isCollapsed;
});

export function EPDSidebar({ className = "", userEmail, userName }: EPDSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Context detection: Level 2 if URL contains /patients/[id]
  const isPatientContext = pathname?.match(/\/epd\/patients\/[^\/]+/);
  const patientId = isPatientContext ? pathname.split('/')[3] : null;

  // Memoize navigation items to prevent recreation on every render
  const navigationItems = useMemo(() => {
    if (isPatientContext) {
      return level2NavigationItems.map(item => ({
        ...item,
        href: `/epd/patients/${patientId}${item.href}`
      }));
    }
    return level1NavigationItems;
  }, [isPatientContext, patientId]);

  // Stabilize event handlers with useCallback
  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const handleItemClick = useCallback(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, []);

  // Memoize isActive check function
  const getIsActive = useCallback((item: NavigationItem): boolean => {
    if (item.id === 'dashboard') {
      return pathname === item.href;
    }
    return pathname === item.href || Boolean(item.href && pathname?.startsWith(item.href + '/'));
  }, [pathname]);

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get user initials
  const userInitials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail?.slice(0, 2).toUpperCase() || 'EP';

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-white shadow-md border border-slate-200 md:hidden hover:bg-slate-50 transition-all duration-200"
        aria-label="Toggle sidebar"
      >
        {isOpen ?
          <X className="h-5 w-5 text-slate-600" /> :
          <Menu className="h-5 w-5 text-slate-600" />
        }
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40 transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-20" : "w-64"}
          md:translate-x-0 md:static md:z-auto
          ${className}
        `}
      >
        {/* Header with logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white font-bold font-mono text-sm">AI</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 text-sm">Mini-EPD</span>
                <span className="text-xs text-slate-500">Prototype</span>
              </div>
            </Link>
          )}

          {isCollapsed && (
            <Link href="/" className="w-9 h-9 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center mx-auto shadow-sm hover:shadow-md transition-shadow">
              <span className="text-white font-bold font-mono text-sm">AI</span>
            </Link>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-md hover:bg-slate-100 transition-all duration-200"
            aria-label={isCollapsed ? "Uitklappen" : "Inklappen"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {/* Back to Cliënten button (Level 2 only) */}
          {isPatientContext && (
            <>
              <Link
                href="/epd/patients"
                className="flex items-center gap-2 px-3 py-2.5 mb-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                {!isCollapsed && <span>Cliënten</span>}
              </Link>
              <div className="h-px bg-slate-200 my-2 mx-3" />
            </>
          )}

          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={getIsActive(item)}
                isCollapsed={isCollapsed}
                onClick={handleItemClick}
              />
            ))}
          </ul>
        </nav>

        {/* Bottom section with profile and logout */}
        <div className="mt-auto border-t border-slate-200">
          {/* Profile Section */}
          <div className={`border-b border-slate-200 bg-slate-50/30 ${isCollapsed ? 'py-3 px-2' : 'p-3'}`}>
            {!isCollapsed ? (
              <div className="flex items-center px-3 py-2 rounded-md bg-white hover:bg-slate-50 transition-colors duration-200">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-medium text-xs">{userInitials}</span>
                </div>
                <div className="flex-1 min-w-0 ml-2.5">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {userName || userEmail || 'Demo User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {userEmail || 'demo@mini-epd.demo'}
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2" title="Online" />
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-medium text-xs">{userInitials}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="p-3">
            <button
              onClick={() => window.location.href = '/auth/logout'}
              className={`
                w-full flex items-center rounded-md text-left transition-all duration-200 group
                text-red-600 hover:bg-red-50 hover:text-red-700
                ${isCollapsed ? "justify-center p-2.5" : "space-x-2.5 px-3 py-2.5"}
              `}
              title={isCollapsed ? "Uitloggen" : undefined}
            >
              <div className="flex items-center justify-center min-w-[20px]">
                <LogOut className="h-5 w-5 flex-shrink-0 text-red-500 group-hover:text-red-600" />
              </div>

              {!isCollapsed && (
                <span className="text-sm">Uitloggen</span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  Uitloggen
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-800 rotate-45" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
