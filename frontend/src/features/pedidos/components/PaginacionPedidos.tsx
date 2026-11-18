interface Props {
  pagina: number;
  limite: number;
  total: number;
  cargando: boolean;
  onPagina: (pagina: number) => void;
}

export default function PaginacionPedidos({ pagina, limite, total, cargando, onPagina }: Props) {
  if (pagina === 0 && total <= limite) return null;
  return (
    <nav aria-label="Paginación de pedidos" className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <button type="button" className="btn-secundario" disabled={pagina === 0 || cargando}
        onClick={() => onPagina(pagina - 1)}>Anterior</button>
      <span>Página {pagina + 1}</span>
      <button type="button" className="btn-secundario" disabled={(pagina + 1) * limite >= total || cargando}
        onClick={() => onPagina(pagina + 1)}>Siguiente</button>
    </nav>
  );
}
