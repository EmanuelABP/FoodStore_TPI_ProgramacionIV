import { Cargando, ErrorMensaje } from "@/shared/components/EstadoListado";
import { importe } from "../formato";
import { useResumenPedidos } from "../hooks/usePedidos";

export default function AdminResumenPage() {
  const resumen = useResumenPedidos();
  const datos = resumen.data;
  const indicadores = datos && [
    { etiqueta: "Pendientes", valor: datos.pendientes },
    { etiqueta: "En preparación", valor: datos.en_preparacion },
    { etiqueta: "Entregados", valor: datos.entregados },
    { etiqueta: "Cancelados", valor: datos.cancelados },
    { etiqueta: "Pedidos de hoy", valor: datos.pedidos_hoy },
    { etiqueta: "Ingresos de pedidos entregados", valor: importe(datos.ingresos_entregados) },
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-6 py-10">
      <h1 className="text-3xl font-bold">Resumen del negocio</h1>
      {resumen.isPending ? <Cargando mensaje="Cargando resumen…" /> :
        resumen.isError ? <ErrorMensaje mensaje={resumen.error.message} /> : (
          <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {indicadores?.map(({ etiqueta, valor }) => (
              <div key={etiqueta} className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <dt className="text-sm font-medium text-slate-600 dark:text-slate-300">{etiqueta}</dt>
                <dd className="importe mt-2 text-xl font-bold sm:text-2xl">{valor}</dd>
              </div>
            ))}
          </dl>
        )}
    </main>
  );
}
