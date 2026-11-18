import { useState } from "react";

interface Props {
  url?: string | null;
  nombre: string;
  miniatura?: boolean;
}

const logo = "/logo-foodstore.png";

function urlImagen(valor: string | null | undefined): string | undefined {
  if (!valor?.trim()) return;
  try {
    const url = new URL(valor.trim(), window.location.origin);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch {
    return;
  }
}

function Imagen({ url, nombre, miniatura = false }: Props) {
  const [estado, setEstado] = useState(url ? "foto" : "logo");
  const respaldo = estado !== "foto";
  const marco = miniatura ? "h-14 w-14 shrink-0 rounded-md" : "aspect-video w-full";
  const fondo = respaldo ? "bg-[#020817]" : "bg-slate-100 dark:bg-slate-800";

  return (
    <div className={`flex items-center justify-center overflow-hidden ${marco} ${fondo}`}>
      {estado === "texto" ? (
        <span role="img" aria-label={`Imagen no disponible de ${nombre}`}
          className={`px-1 text-center text-slate-300 ${miniatura ? "text-[9px]" : "text-sm"}`}>
          Sin imagen
        </span>
      ) : (
        <img src={respaldo ? logo : url ?? undefined} loading="lazy"
          alt={respaldo ? `Food Store — imagen de respaldo para ${nombre}` : nombre}
          className={`h-full w-full ${respaldo ? "object-contain p-1" : "object-cover"}`}
          onError={() => setEstado(respaldo ? "texto" : "logo")} />
      )}
    </div>
  );
}

export default function ProductoImagen({ url, nombre, miniatura }: Props) {
  const fuente = urlImagen(url);
  const foto = fuente && new URL(fuente).pathname !== logo ? fuente : undefined;
  return <Imagen key={foto ?? logo} url={foto} nombre={nombre} miniatura={miniatura} />;
}
