import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificarError } from "@/shared/api/notificarError";
import { useNotificationStore } from "@/store/notificationStore";

interface Servicio<Registro, Datos> {
  listar: (signal: AbortSignal) => Promise<Registro[]>;
  obtener: (id: number, signal: AbortSignal) => Promise<Registro>;
  crear: (datos: Datos) => Promise<Registro>;
  actualizar: (id: number, datos: Partial<Datos>) => Promise<Registro>;
  eliminar: (id: number) => Promise<void>;
}

export function useCatalogo<Registro extends Datos & { id: number }, Datos extends object>(
  clave: string,
  servicio: Servicio<Registro, Datos>,
  clavesAfectadas: string[] = [],
) {
  const [abierto, setAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState<Registro | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const cliente = useQueryClient();
  const listado = useQuery({
    queryKey: [clave, "lista"],
    queryFn: ({ signal }) => servicio.listar(signal),
  });
  const avisar = (mensaje: string) => {
    useNotificationStore.getState().showNotification(mensaje);
    return Promise.all([clave, ...clavesAfectadas].map((key) => cliente.invalidateQueries({ queryKey: [key] })));
  };
  const alta = useMutation({
    mutationFn: servicio.crear,
    onSuccess: () => avisar("Registro creado."),
    onError: (error: Error) => notificarError(error),
  });
  const edicion = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: Partial<Datos> }) => servicio.actualizar(id, datos),
    onSuccess: () => avisar("Cambios guardados."),
    onError: (error: Error) => notificarError(error),
  });
  const baja = useMutation({
    mutationFn: servicio.eliminar,
    onSuccess: () => avisar("Registro dado de baja."),
    onError: (error: Error) => notificarError(error),
  });
  const ocupado = cargandoDetalle || alta.isPending || edicion.isPending || baja.isPending;

  async function abrir(registro: Registro | null) {
    alta.reset();
    edicion.reset();
    baja.reset();
    setErrorDetalle("");
    if (registro === null) {
      setSeleccionado(null);
      setAbierto(true);
      return;
    }

    setCargandoDetalle(true);
    try {
      const detalle = await cliente.fetchQuery({
        queryKey: [clave, "detalle", registro.id],
        queryFn: ({ signal }) => servicio.obtener(registro.id, signal),
      });
      setSeleccionado(detalle);
      setAbierto(true);
    } catch (error) {
      setErrorDetalle(error instanceof Error ? error.message : "No se pudo consultar el detalle.");
    } finally {
      setCargandoDetalle(false);
    }
  }

  function cerrar() {
    setAbierto(false);
    setSeleccionado(null);
  }

  async function guardar(datos: Datos) {
    try {
      if (seleccionado) {
        const cambios: Partial<Datos> = {};
        for (const campo of Object.keys(datos) as (keyof Datos)[]) {
          if (!Object.is(datos[campo], seleccionado[campo])) cambios[campo] = datos[campo];
        }
        if (Object.keys(cambios).length > 0) await edicion.mutateAsync({ id: seleccionado.id, datos: cambios });
      } else {
        await alta.mutateAsync(datos);
      }
      cerrar();
    } catch {
      // La mutación conserva el error para mostrarlo en el formulario.
    }
  }

  async function eliminar(id: number) {
    if (ocupado) return;
    alta.reset();
    edicion.reset();
    setErrorDetalle("");
    await baja.mutateAsync(id);
  }

  return {
    listado, ocupado, abierto, seleccionado, abrir, cerrar, guardar, eliminar, cargandoDetalle, errorDetalle,
    errorFormulario: alta.error?.message ?? edicion.error?.message,
    errorBaja: baja.error?.message,
  };
}
