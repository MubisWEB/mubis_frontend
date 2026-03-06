import { ArrowRight, Play, Clock, Users, Gavel, TrendingUp } from "lucide-react";
import auctionCar from "@/assets/auction-car.jpg";
import auctionCar2 from "@/assets/auction-car-2.jpg";
import auctionCar3 from "@/assets/auction-car-3.jpg";
import { useState, useEffect, useCallback, useRef } from "react";

const auctions = [
  {
    id: "MUB-20394",
    title: "Mazda 3 Sedán 2023",
    details: "12,400 km · Automático · Bogotá",
    image: auctionCar,
    bid: "$78.500.000",
    bids: 3,
    dealers: 25,
    time: { hours: 0, minutes: 47, seconds: 12 },
  },
  {
    id: "MUB-20412",
    title: "Toyota Corolla 2022",
    details: "28,100 km · Automático · Medellín",
    image: auctionCar2,
    bid: "$65.200.000",
    bids: 7,
    dealers: 18,
    time: { hours: 0, minutes: 18, seconds: 45 },
  },
  {
    id: "MUB-20455",
    title: "Chevrolet Tracker 2024",
    details: "3,200 km · Automático · Cali",
    image: auctionCar3,
    bid: "$52.800.000",
    bids: 5,
    dealers: 12,
    time: { hours: 0, minutes: 55, seconds: 30 },
  },
];

// position 0 = front, 1 = middle-back, 2 = far-back
const positionStyles: Record<number, string> = {
  0: "z-30 translate-x-0 translate-y-0 rotate-0 scale-100 opacity-100",
  1: "z-20 translate-x-5 translate-y-3 rotate-2 scale-[0.95] opacity-90",
  2: "z-10 translate-x-10 translate-y-6 rotate-[4deg] scale-[0.90] opacity-75",
};

const AuctionCard = ({
  auction,
  position,
  onClick,
  timeLeft,
}: {
  auction: (typeof auctions)[0];
  position: number;
  onClick: () => void;
  timeLeft: { hours: number; minutes: number; seconds: number };
}) => {
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div
      onClick={() => { onClick(); window.location.href = '/registro'; }}
      className={`absolute inset-0 w-full bg-background rounded-2xl border border-border shadow-xl overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${positionStyles[position]}`}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/10 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
          <span className="text-xs font-bold text-primary uppercase tracking-wide">Subasta en vivo</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono font-bold text-foreground">
            {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
          </span>
        </div>
      </div>

      <div className="relative aspect-[16/8] bg-muted">
        <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-secondary-foreground uppercase">
            <Gavel className="w-3 h-3" /> Verificado
          </span>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-bold text-foreground text-base">{auction.title}</h3>
          <p className="text-xs text-muted-foreground">{auction.details}</p>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Puja actual</p>
            <p className="text-lg font-black text-foreground blur-sm select-none">{auction.bid}</p>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold">+{auction.bids} pujas</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span><span className="font-bold text-foreground">{auction.dealers} Dealers</span> participando</span>
          </div>
          <span className="text-[10px] font-medium">ID: {auction.id}</span>
        </div>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const [order, setOrder] = useState([0, 1, 2]); // indices into auctions
  const [timers, setTimers] = useState(auctions.map((a) => ({ ...a.time })));
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [paused, setPaused] = useState(false);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          let { hours, minutes, seconds } = t;
          seconds--;
          if (seconds < 0) { seconds = 59; minutes--; }
          if (minutes < 0) { minutes = 59; hours--; }
          if (hours < 0) { hours = 0; minutes = 0; seconds = 0; }
          return { hours, minutes, seconds };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate every 8 seconds
  const rotate = useCallback(() => {
    setOrder((prev) => {
      const next = [...prev];
      const first = next.shift()!;
      next.push(first);
      return next;
    });
  }, []);

  useEffect(() => {
    if (paused) return;
    autoRef.current = setInterval(rotate, 8000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [rotate, paused]);

  const handleClick = useCallback((auctionIndex: number) => {
    setOrder((prev) => {
      const pos = prev.indexOf(auctionIndex);
      if (pos === 0) return prev; // already front
      const next = [auctionIndex, ...prev.filter((i) => i !== auctionIndex)];
      return next;
    });
    // Pause auto-rotate briefly on manual click
    setPaused(true);
    setTimeout(() => setPaused(false), 6000);
  }, []);

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-foreground">
              Subastas<br />privadas de autos<br />usados
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground">
              Concesionarios compiten por<br />
              <span className="font-bold text-foreground">inventario verificado.</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/registro"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground hover:opacity-90 transition-opacity"
              >
                Aplicar Ahora <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/como-funciona"
                className="inline-flex items-center gap-2 rounded-full border border-foreground px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Play className="w-4 h-4" /> Cómo funciona
              </a>
            </div>
          </div>

          {/* Stacked auction cards */}
          <div className="relative z-10 flex justify-center">
            <div className="relative w-full max-w-md min-h-[430px]">
              {order.map((auctionIdx, pos) => (
                <AuctionCard
                  key={auctions[auctionIdx].id}
                  auction={auctions[auctionIdx]}
                  position={pos}
                  onClick={() => handleClick(auctionIdx)}
                  timeLeft={timers[auctionIdx]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
