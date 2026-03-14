import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import TopBar from "@/components/TopBar";

export default function Header({ title, subtitle, backTo, children }) {
  const navigate = useNavigate();

  return (
    <>
      <TopBar />
      <nav className="w-full bg-background border-b border-border">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center h-14 gap-3">
          <div className="flex-1 flex items-center justify-center min-w-0">
            <MubisLogo size="sm" />
          </div>
          {children && <div className="flex-shrink-0">{children}</div>}
        </div>
      </nav>
      {(title || subtitle || backTo) && (
        <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-2 flex items-center gap-3">
          {backTo && (
            <button onClick={() => navigate(backTo)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          )}
          <div>
            {title && <h1 className="text-xl font-bold text-foreground font-sans">{title}</h1>}
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
    </>
  );
}
