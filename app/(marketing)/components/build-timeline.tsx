"use client";

import { useMotionValueEvent, useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
  Rocket, Database, Sparkles, Palette, Calendar, Layout,
  Users, Smartphone, FileText, Brain, Tags, Target,
  HelpCircle, Zap, Eye
} from "lucide-react";

// Icon mapping
const iconMap = {
  Rocket,
  Database,
  Sparkles,
  Palette,
  Calendar,
  Layout,
  Users,
  Smartphone,
  FileText,
  Brain,
  Tags,
  Target,
  HelpCircle,
  Zap,
  Eye,
};

interface Feature {
  title: string;
  description: string;
  time?: string;
  traditional?: string;
  icon: keyof typeof iconMap;
}

interface WeekData {
  weekNumber: number;
  title: string;
  status: "completed" | "in_progress" | "planned";
  description: string;
  features: Feature[];
  metrics: {
    hours: string;
    cost: string;
    linesOfCode: string;
  };
  achievements: string[];
}

interface TimelineData {
  heading: string;
  description: string;
  weeks: WeekData[];
}

interface BuildTimelineProps {
  data: TimelineData;
}

const StatusBadge = ({ status }: { status: WeekData["status"] }) => {
  const styles = {
    completed: "bg-teal-100 text-teal-700 border-teal-200",
    in_progress: "bg-amber-100 text-amber-700 border-amber-200",
    planned: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const labels = {
    completed: "Voltooid",
    in_progress: "Bezig",
    planned: "Gepland",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const FeatureCard = ({ feature }: { feature: Feature }) => {
  const Icon = iconMap[feature.icon];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 text-sm mb-1">
            {feature.title}
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed">
            {feature.description}
          </p>
          {feature.time && feature.traditional && (
            <div className="mt-2 flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-teal-600">Met AI:</span>
                <span className="text-slate-900 font-semibold">{feature.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-500">Traditioneel:</span>
                <span className="text-slate-600 line-through">{feature.traditional}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const BuildTimeline = ({ data }: BuildTimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full bg-slate-50 font-sans" ref={containerRef}>
      {/* Header */}
      <div className="max-w-7xl mx-auto py-16 px-4 md:px-8 lg:px-10 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {data.heading}
        </h2>
        <p className="text-slate-600 text-lg max-w-3xl mx-auto">
          {data.description}
        </p>
      </div>

      {/* Timeline */}
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.weeks.map((week, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-20 md:gap-10"
          >
            {/* Left side - Week title (sticky) */}
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              {/* Timeline dot */}
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-teal-500 border-2 border-white shadow-md" />
              </div>

              {/* Week title - hidden on mobile */}
              <div className="hidden md:block md:pl-20">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                  {week.title}
                </h3>
                <StatusBadge status={week.status} />
              </div>
            </div>

            {/* Right side - Content */}
            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              {/* Week title - mobile only */}
              <div className="md:hidden mb-4">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  {week.title}
                </h3>
                <StatusBadge status={week.status} />
              </div>

              {/* Description */}
              <p className="text-slate-700 text-base leading-relaxed mb-6">
                {week.description}
              </p>

              {/* Features */}
              {week.features.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Features
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {week.features.map((feature, fIndex) => (
                      <FeatureCard key={fIndex} feature={feature} />
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Metrics
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-teal-600">
                      {week.metrics.hours}
                    </div>
                    <div className="text-xs text-slate-500">Development</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-teal-600">
                      {week.metrics.cost}
                    </div>
                    <div className="text-xs text-slate-500">Infrastructure</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-teal-600">
                      {week.metrics.linesOfCode}
                    </div>
                    <div className="text-xs text-slate-500">Lines of Code</div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              {week.achievements.length > 0 && (
                <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-teal-700 uppercase tracking-wide mb-2">
                    Achievements
                  </h4>
                  <ul className="space-y-1">
                    {week.achievements.map((achievement, aIndex) => (
                      <li key={aIndex} className="text-sm text-slate-700">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Link to detailed documentation */}
              <a
                href="/releases"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors"
              >
                <span>Bekijk uitgebreide documentatie</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        ))}

        {/* Animated timeline line */}
        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-gradient-to-b from-transparent via-slate-300 to-transparent"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-b from-teal-500 via-teal-400 to-transparent rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
