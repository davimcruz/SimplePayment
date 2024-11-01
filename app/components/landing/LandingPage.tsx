import Header from "@/app/components/landing/landing-components/LandingHeader";
import LandingHero from "@/app/components/landing/landing-components/LandingHero";
import AboutUs from "@/app/components/landing/landing-components/AboutUs";
import LandingFeatures from "@/app/components/landing/landing-components/LandingFeatures";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black overflow-hidden">
      <Header />
      <LandingHero />
      <LandingFeatures />
      <AboutUs />
    </div>
  );
};

export default LandingPage;
