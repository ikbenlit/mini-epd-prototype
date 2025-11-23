'use client'

import React from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

// Icon component for contact details
const InfoIcon = ({ type }: { type: 'website' | 'phone' | 'address' }) => {
    const icons = {
        website: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" x2="22" y1="12" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
        ),
        phone: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
        ),
        address: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
        ),
    };
    return <div className="mr-2 flex-shrink-0">{icons[type]}</div>;
};


// Prop types for the HeroSection component
interface HeroSectionProps {
  logo?: {
    url: string;
    alt: string;
    text?: string;
  };
  slogan?: string;
  title: React.ReactNode;
  subtitle: string | React.ReactNode;
  punchline?: string | React.ReactNode;
  callToAction: {
    text: string;
    href: string;
  };
  secondaryCallToAction?: {
    text: string;
    href: string;
  };
  backgroundImage: string;
  contactInfo?: {
    website: string;
    phone: string;
    address: string;
  };
  className?: string;
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  ({ className, logo, slogan, title, subtitle, punchline, callToAction, secondaryCallToAction, backgroundImage, contactInfo, ...props }, ref) => {
    
    // Animation variants for the container to orchestrate children animations
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.15,
          delayChildren: 0.2,
        },
      },
    };

    // Animation variants for individual text/UI elements
    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: "easeOut" as const,
        },
      },
    };
    
    return (
      <motion.section
        ref={ref}
        className={cn(
          "relative flex w-full flex-col overflow-hidden bg-background text-foreground md:flex-row",
          className
        )}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        {...props}
      >
        {/* Left Side: Content */}
        <div className="flex w-full flex-col justify-between p-8 md:w-1/2 md:p-12 lg:w-3/5 lg:p-16">
            {/* Top Section: Logo & Main Content */}
            <div>
                <motion.header className="mb-12" variants={itemVariants}>
                    {logo && (
                        <div className="flex items-center">
                            <Image
                              src={logo.url}
                              alt={logo.alt}
                              width={120}
                              height={32}
                              className="mr-3 h-8 w-auto"
                              unoptimized
                            />
                            <div>
                                {logo.text && <p className="text-lg font-bold text-foreground">{logo.text}</p>}
                                {slogan && <p className="text-xs tracking-wider text-muted-foreground">{slogan}</p>}
                            </div>
                        </div>
                    )}
                </motion.header>

                <motion.main variants={containerVariants}>
                    <motion.h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl" variants={itemVariants}>
                        {title}
                    </motion.h1>
                    <motion.div className="my-6 h-1 w-20 bg-primary" variants={itemVariants}></motion.div>
                    <motion.div className="mb-6 max-w-lg text-base md:text-lg leading-relaxed text-slate-600" variants={itemVariants}>
                        {subtitle}
                    </motion.div>

                    {punchline && (
                        <motion.aside
                            className="mb-8 max-w-lg md:max-w-2xl border-l-4 border-primary bg-slate-50 p-6 rounded-r-lg"
                            variants={itemVariants}
                            role="note"
                        >
                            <div className="text-base md:text-lg font-medium text-slate-800 leading-relaxed [&_*:not(br)]:whitespace-normal md:[&_*:not(br)]:whitespace-nowrap">
                                {punchline}
                            </div>
                        </motion.aside>
                    )}

                    <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
                        <a
                            href={callToAction.href}
                            className="inline-block px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold text-base tracking-wide rounded-lg transition-colors text-center"
                        >
                            {callToAction.text}
                        </a>
                        {secondaryCallToAction && (
                            <a
                                href={secondaryCallToAction.href}
                                className="inline-block px-8 py-4 border-2 border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-base rounded-lg transition-colors text-center"
                            >
                                {secondaryCallToAction.text}
                            </a>
                        )}
                    </motion.div>
                </motion.main>
            </div>

            {/* Bottom Section: Footer Info */}
            {contactInfo && (
                <motion.footer className="mt-12 w-full" variants={itemVariants}>
                    <div className="grid grid-cols-1 gap-6 text-xs text-muted-foreground sm:grid-cols-3">
                        <div className="flex items-center">
                            <InfoIcon type="website" />
                            <span>{contactInfo.website}</span>
                        </div>
                        <div className="flex items-center">
                            <InfoIcon type="phone" />
                            <span>{contactInfo.phone}</span>
                        </div>
                        <div className="flex items-center">
                            <InfoIcon type="address" />
                            <span>{contactInfo.address}</span>
                        </div>
                    </div>
                </motion.footer>
            )}
        </div>

        {/* Right Side: Image with Clip Path Animation */}
        <motion.div
          className="w-full h-[40vh] bg-cover bg-center md:w-1/2 md:h-auto md:min-h-full lg:w-2/5"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
          initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
          animate={{ clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)' }}
          transition={{ duration: 1.2, ease: "circOut" }}
        >
        </motion.div>
      </motion.section>
    );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };
