import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://mubis.co";
const DEFAULT_TITLE = "Mubis | Subastas de carros para concesionarios";
const DEFAULT_DESCRIPTION =
  "Compra y vende vehiculos entre concesionarios, recompradores y aliados con subastas verificadas por peritaje en Colombia.";
const DEFAULT_IMAGE = `${SITE_URL}/MubisLogo.png`;

const PUBLIC_SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/como-funciona": {
    title: "Como funciona Mubis | Subastas vehiculares verificadas",
    description:
      "Conoce el flujo de Mubis: publicacion, peritaje, subasta, decision del vendedor y postventa para concesionarios y recompradores.",
  },
  "/para-dealers": {
    title: "Mubis para dealers | Compra y vende inventario automotriz",
    description:
      "Mubis conecta dealers, administradores de concesionario y recompradores para mover inventario vehicular con subastas B2B.",
  },
  "/contacto": {
    title: "Contacto | Mubis",
    description:
      "Habla con el equipo de Mubis para conocer la plataforma de subastas de carros para concesionarios y aliados automotrices.",
  },
  "/preguntas-frecuentes": {
    title: "Preguntas frecuentes | Mubis",
    description:
      "Resuelve dudas sobre registro, peritajes, subastas, publicaciones, recompras y funcionamiento general de Mubis.",
  },
  "/terminos-y-condiciones": {
    title: "Terminos y condiciones | Mubis",
    description: "Consulta los terminos y condiciones de uso de la plataforma Mubis.",
  },
  "/politica-de-privacidad": {
    title: "Politica de privacidad | Mubis",
    description: "Consulta la politica de privacidad y tratamiento de datos personales de Mubis.",
  },
  "/aviso-legal": {
    title: "Aviso legal | Mubis",
    description: "Consulta la informacion legal de Mubis y sus canales oficiales de contacto.",
  },
};

const NOINDEX_PATHS = new Set([
  "/login",
  "/registro",
  "/registro-confirmacion",
  "/recuperar-contrasena",
  "/set-password",
  "/pendienteverificacion",
]);

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attrs).forEach(([name, value]) => element?.setAttribute(name, value));
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export default function SeoMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const lowerPath = normalizedPath.toLowerCase();
    const seo = PUBLIC_SEO[normalizedPath] ?? PUBLIC_SEO[lowerPath] ?? {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    };
    const isPublic = Boolean(PUBLIC_SEO[normalizedPath] ?? PUBLIC_SEO[lowerPath]);
    const isNoIndex = !isPublic || NOINDEX_PATHS.has(lowerPath);
    const canonicalUrl = isPublic ? `${SITE_URL}${normalizedPath === "/" ? "/" : normalizedPath}` : SITE_URL;
    const robots = isNoIndex ? "noindex, nofollow" : "index, follow";

    document.title = seo.title;
    upsertMeta('meta[name="description"]', { name: "description", content: seo.description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[name="googlebot"]', {
      name: "googlebot",
      content: isNoIndex
        ? "noindex, nofollow"
        : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    });

    upsertCanonical(canonicalUrl);
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: seo.title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: seo.description });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: DEFAULT_IMAGE });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: seo.title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: seo.description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: DEFAULT_IMAGE });
  }, [pathname]);

  return null;
}
