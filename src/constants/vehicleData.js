// Catálogo completo de marcas y modelos de vehículos
export const VEHICLE_CATALOG = {
  'Toyota': ['Corolla', 'Camry', 'RAV4', 'Hilux', 'Prado', 'Fortuner', 'Yaris', 'Land Cruiser', 'Tacoma', 'Prius', 'Highlander', '4Runner'],
  'Chevrolet': ['Onix', 'Onix Plus', 'Spark', 'Sail', 'Beat', 'Sonic', 'Cruze', 'Malibu', 'Camaro', 'Groove', 'Trax', 'Tracker', 'Trailblazer', 'Captiva', 'Equinox', 'Blazer', 'Traverse', 'Tahoe', 'Suburban', 'S10', 'Montana', 'Colorado', 'Silverado'],
  'Mazda': ['2', '3', '6', 'CX-3', 'CX-5', 'CX-9', 'CX-30', 'MX-5', 'BT-50'],
  'Renault': ['Logan', 'Sandero', 'Duster', 'Kwid', 'Captur', 'Koleos', 'Stepway', 'Oroch'],
  'Kia': ['Picanto', 'Rio', 'Cerato', 'Sportage', 'Sorento', 'Seltos', 'Stonic', 'Carnival', 'Soul', 'Optima'],
  'Hyundai': ['i10', 'Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Creta', 'Kona', 'Palisade', 'Veloster', 'Ioniq'],
  'Volkswagen': ['Gol', 'Polo', 'Jetta', 'Tiguan', 'Touareg', 'Amarok', 'T-Cross', 'Passat', 'Golf', 'Arteon'],
  'Ford': ['Fiesta', 'Focus', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Expedition', 'F-150', 'Ranger', 'Bronco', 'EcoSport'],
  'Nissan': ['Versa', 'Sentra', 'Altima', 'Kicks', 'Qashqai', 'X-Trail', 'Pathfinder', 'Frontier', 'Patrol', 'Leaf', 'Maxima'],
  'BMW': ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 7', 'X1', 'X3', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i8'],
  'Mercedes-Benz': ['Clase A', 'Clase C', 'Clase E', 'Clase S', 'GLA', 'GLC', 'GLE', 'GLS', 'CLA', 'CLS', 'G-Class', 'Sprinter'],
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron'],
  'Honda': ['City', 'Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Odyssey', 'Fit', 'Ridgeline'],
  'Suzuki': ['Alto', 'Swift', 'Baleno', 'Vitara', 'S-Cross', 'Jimny', 'Ertiga', 'Ignis'],
  'Mitsubishi': ['Mirage', 'Lancer', 'Outlander', 'Montero', 'ASX', 'Eclipse Cross', 'L200', 'Pajero'],
  'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator'],
  'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'XV', 'WRX', 'BRZ'],
  'Peugeot': ['208', '301', '308', '408', '508', '2008', '3008', '5008', 'Partner', 'Rifter'],
  'Fiat': ['Palio', 'Uno', 'Argo', 'Cronos', 'Mobi', '500', 'Toro', 'Ducato'],
  'JAC': ['S2', 'S3', 'S4', 'T6', 'T8', 'X200'],
  'Mini': ['Cooper', 'Cooper S', 'Countryman', 'Countryman S', 'Clubman', 'Paceman', 'Cabrio'],
  'BYD': ['Han', 'Tang', 'Song Plus', 'Song Pro', 'Yuan Plus', 'Dolphin', 'Seal', 'Atto 3', 'Sea Lion'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Cayman', 'Boxster'],
  'Lexus': ['IS', 'ES', 'GS', 'LS', 'NX', 'RX', 'GX', 'LX', 'UX', 'RC', 'LC', 'CT'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar', 'Freelander'],
  'Jaguar': ['XE', 'XF', 'XJ', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace'],
};

// Lista de todas las marcas
export const ALL_BRANDS = Object.keys(VEHICLE_CATALOG).sort();

// Función helper para obtener modelos de una marca
export const getModelsForBrand = (brand) => {
  return VEHICLE_CATALOG[brand] || [];
};

// Rangos de años disponibles
export const CURRENT_YEAR = new Date().getFullYear();
export const YEAR_RANGE = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);
