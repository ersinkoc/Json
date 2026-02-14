import React from 'react';
import { 
  HeroSection, 
  FeaturesSection, 
  QuickStartSection,
  PluginsSection,
  ApiSection,
  StatsSection,
  CLISection,
  CTASection 
} from '@/components/sections/hero';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <QuickStartSection />
      <StatsSection />
      <PluginsSection />
      <ApiSection />
      <CLISection />
      <CTASection />
    </>
  );
}
