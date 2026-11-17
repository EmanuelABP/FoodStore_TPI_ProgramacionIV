import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificarError } from "@/shared/api/notificarError";
import { useNotificationStore } from "@/store/notificationStore";

interface Servicio<Registro, Datos> {
  listar: (signal: AbortSignal) => Promise<Registro[]>;
  crear: (datos: Datos) => Promise<Registro>;
  actualizar: (id: number, datos: Datos) => Promise<Registro>;
  eliminar: (id: number) => Promise<void>;
}

export function useCatalogo<Registro extends { id: number }, Datos>(
  clave: string,
  servicio: Servicio<Registro, Datos>,
) {
  const [abierto, setAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState<Registro | null>(null);
  const cliente = useQueryClient();
  const listado = useQuery({
    queryKey: [clave],
    queryFn: ({ signal }) => servicio.listar(signal),
  });
  const invalidar = () => cliente.invalidateQueries({ queryKey: [clave] });
  const avisar = (mensaje: string) => {
    useNotificationStore.getState().showNotification(mensaje);
    return invalidar();
  };
  const alta = useMutation({
    mutationFn: servicio.crear,
    onSuccess: () => avisar("Registro creado."),
    onError: (error: Error) => notificarError(error),
  });
  const edicion = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: Datos }) => servicio.actualizar(id, datos),
    onSuccess: () => avisar("Cambios guardados."),
    onError: (error: Error) => notificarError(error),
  });
  const baja = useMutation({
    mutationFn: servicio.eliminar,
    onSuccess: () => avisar("Registro eliminado."),
    onError: (error: Error) => notificarError(error),
  });

  useEffect(() => {
    if (listado.error) notificarError(listado.error);
  }, [listado.error]);
  const ocupado = alta.isPending || edicion.isPending || baja.isPending;

  function abrir(registro: Registro | null) {
    alta.reset();
    edicion.reset();
    baja.reset();
    setSeleccionado(registro);
    setAbierto(true);
  }

  function cerrar() {
    setAbierto(false);
    setSeleccionado(null);
  }

  async function guardar(datos: Datos) {
    try {
      if (seleccionado) await edicion.mutateAsync({ id: seleccionado.id, datos });
      else await alta.mutateAsync(datos);
      cerrar();
    } catch {
      // La mutación conserva el error para mostrarlo en el modal.
    }
  }

  function eliminar(id: number) {
    if (ocupado || !window.confirm("¿Querés eliminar este registro?")) return;
    alta.reset();
    edicion.reset();
    baja.mutate(id);
  }

  return {
    listado, ocupado, abierto, seleccionado, abrir, cerrar, guardar, eliminar,
    errorFormulario: alta.error?.message ?? edicion.error?.message,
    errorBaja: baja.error?.message,
  };
}
