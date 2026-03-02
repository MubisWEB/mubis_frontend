// Mock data for Mubis™ landing page

export const vehicles = [
  {
    id: 1,
    brand: "Chevrolet",
    model: "Tracker LT",
    year: 2023,
    km: 18500,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop",
    status: "en_subasta" as const,
  },
  {
    id: 2,
    brand: "Renault",
    model: "Koleos Intens",
    year: 2022,
    km: 32000,
    image: "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400&h=300&fit=crop",
    status: "vendido" as const,
  },
  {
    id: 3,
    brand: "Mazda",
    model: "CX-30 Grand Touring",
    year: 2024,
    km: 8200,
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop",
    status: "en_subasta" as const,
  },
  {
    id: 4,
    brand: "Kia",
    model: "Sportage SXL",
    year: 2023,
    km: 15800,
    image: "https://images.unsplash.com/photo-1619767886558-efdc259b6e09?w=400&h=300&fit=crop",
    status: "en_subasta" as const,
  },
  {
    id: 5,
    brand: "Toyota",
    model: "Corolla Cross",
    year: 2023,
    km: 22400,
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop",
    status: "vendido" as const,
  },
  {
    id: 6,
    brand: "Nissan",
    model: "Kicks Exclusive",
    year: 2024,
    km: 5600,
    image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop",
    status: "en_subasta" as const,
  },
  {
    id: 7,
    brand: "Hyundai",
    model: "Tucson Limited",
    year: 2022,
    km: 41000,
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop",
    status: "vendido" as const,
  },
  {
    id: 8,
    brand: "Ford",
    model: "Territory Titanium",
    year: 2023,
    km: 12300,
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop",
    status: "en_subasta" as const,
  },
];

export const stats = [
  { label: "Vehículos vendidos", value: 2847, suffix: "+" },
  { label: "Dealers activos", value: 156, suffix: "" },
  { label: "Tiempo promedio de cierre", value: 36, suffix: "h" },
  { label: "Tasa de satisfacción", value: 98, suffix: "%" },
];

export const pressLogos = [
  { name: "El Tiempo", placeholder: "ET" },
  { name: "Portafolio", placeholder: "PF" },
  { name: "La República", placeholder: "LR" },
  { name: "Semana", placeholder: "SM" },
  { name: "Forbes Colombia", placeholder: "FC" },
];

export const testimonial = {
  quote: "Mubis transformó la manera en que adquirimos inventario. El proceso es transparente, rápido y la calidad de los vehículos siempre supera nuestras expectativas.",
  author: "Carlos Mendoza",
  role: "Director Comercial",
  company: "AutoMax Bogotá",
};

export const benefits = [
  {
    icon: "Shield",
    title: "Inventario verificado",
    description: "Cada vehículo pasa por un peritaje estandarizado de 150+ puntos antes de entrar a subasta.",
  },
  {
    icon: "DollarSign",
    title: "Precios transparentes",
    description: "Sin intermediarios ni comisiones ocultas. El precio que ves es el precio que pagas.",
  },
  {
    icon: "FileCheck",
    title: "Documentación garantizada",
    description: "Verificamos la legalidad y estado de todos los documentos antes de cada transacción.",
  },
  {
    icon: "Clock",
    title: "Cierre en 48 horas",
    description: "Desde la puja ganadora hasta la entrega del vehículo en tiempo récord.",
  },
];

export const howItWorks = [
  {
    step: 1,
    title: "Solicita acceso",
    description: "Verifica tu negocio y únete a nuestra red exclusiva de dealers certificados.",
  },
  {
    step: 2,
    title: "Explora subastas",
    description: "Accede a inventario verificado con información estandarizada y peritajes detallados.",
  },
  {
    step: 3,
    title: "Puja en tiempo real",
    description: "Participa en subastas competitivas con precios transparentes y sin sorpresas.",
  },
  {
    step: 4,
    title: "Cierra la compra",
    description: "Completa la transacción de forma segura y recibe tu vehículo en menos de 48 horas.",
  },
];

export const cities = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Pereira",
  "Santa Marta",
  "Manizales",
  "Villavicencio",
];
