import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import TopBar from "@/components/TopBar";

export default function Header({ title, subtitle, backTo, children }) {
  const navigate = useNavigate();

  return (
    <>
      <TopBar />
      <nav className="w-full bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-14 gap-3">
          {backTo && (
            <button onClick={() => navigate(backTo)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            {title && <h1 className="text-lg font-bold text-foreground font-sans truncate">{title}</h1>}
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
          {!title && <MubisLogo size="lg" />}
          {children}
        </div>
      </nav>
    </>
  );
}
