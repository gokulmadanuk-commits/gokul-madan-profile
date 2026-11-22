import React, { useEffect } from "react";
import SiteHeader from "@/components/site/SiteHeader";
import Hero from "@/components/site/Hero";
import LogoStrip from "@/components/site/LogoStrip";
import Community from "@/components/site/Community";
import SelectedWork from "@/components/site/SelectedWork";
import Journey from "@/components/site/Journey";
import Connect from "@/components/site/Connect";
import SiteFooter from "@/components/site/SiteFooter";
import { useAnalytics } from "@/hooks/useAnalytics";

const Index: React.FC = () => {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    document.title = "Gokul Madan Alikkal · Consulting, product and sovereign AI";
    trackPageView("Homepage");
    if (window.location.hash) {
      document.querySelector(window.location.hash)?.scrollIntoView();
    }
  }, [trackPageView]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-grow">
        <Hero />
        <LogoStrip />
        <SelectedWork />
        <Journey />
        <Community />
        <Connect />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
