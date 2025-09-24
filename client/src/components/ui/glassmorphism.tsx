import { cn } from "@/lib/utils";

interface GlassmorphismProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

export function Glassmorphism({ children, className, intensity = 'medium' }: GlassmorphismProps) {
  const intensityClasses = {
    light: 'glass-effect opacity-60',
    medium: 'glass-effect opacity-80',
    heavy: 'glass-effect opacity-95 backdrop-blur-xl',
  };

  return (
    <div className={cn(intensityClasses[intensity], className)}>
      {children}
    </div>
  );
}

export function GradientCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("gradient-card rounded-2xl", className)}>
      {children}
    </div>
  );
}

export function PrimaryGradient({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("gradient-primary text-primary-foreground", className)}>
      {children}
    </div>
  );
}
