import { CampaignForm } from "@/components/CampaignForm";
import mozanLogo from "@/assets/mozan-logo.png";
import spaHeroBg from "@/assets/spa-hero-bg.jpg";
import { Sparkles, FileText } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={spaHeroBg} 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/95 via-background/90 to-secondary/95" />
      </div>
      
      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Logo */}
          <div className="text-center">
            <img
              src={mozanLogo}
              alt="Mozan Clinic"
              className="h-30 md:h-36 mx-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Limited Time Offer</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Congratulations!
            </h1>
            
            <p className="text-2xl md:text-3xl text-primary font-semibold">
              You have just redeemed 25% off!
            </p>
            
            <p className="text-muted-foreground max-w-lg mx-auto pt-4">
              At Mozan Clinic, we are renowned not only for the efficacy and high level of safety 
              of our treatments but for our hospitality and good faith when dealing with our clients.
            </p>
          </div>

          {/* Form */}
          <CampaignForm onSuccess={() => {}} />

          {/* Terms & Conditions removed per request */}

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>Follow us on social media</p>
            <div className="flex justify-center gap-4 mt-2">
              <a
                href="https://www.facebook.com/mozanclinic/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Facebook
              </a>
              <span>•</span>
              <a
                href="https://www.instagram.com/mozanclinic/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
