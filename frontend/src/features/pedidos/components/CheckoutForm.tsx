import { useForm } from "@tanstack/react-form";
import CampoCatalogo from "@/shared/components/CampoCatalogo";
import { ErrorMensaje } from "@/shared/components/EstadoListado";
import type { PedidoCreate } from "../types/pedido";

type Entrega = Omit<PedidoCreate, "items"> & { notas: string };

interface Props {
  permitido: boolean;
  ocupado: boolean;
  error?: string;
  onConfirmar: (datos: Entrega) => Promise<void>;
}

export default function CheckoutForm({ permitido, ocupado, error, onConfirmar }: Props) {
  const inicial: Entrega = { direccion_entrega: "", forma_pago: "EFECTIVO", notas: "" };
  const form = useForm({
    defaultValues: inicial,
    onSubmit: ({ value }) => onConfirmar(value),
  });

  return (
    <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
      noValidate onSubmit={(evento) => {
        evento.preventDefault();
        if (permitido && !ocupado && !form.state.isSubmitting) void form.handleSubmit();
      }}>
      <fieldset className="space-y-4" disabled={ocupado}>
        <form.Field name="direccion_entrega" validators={{ onSubmit: ({ value }) =>
          value.trim().length >= 5 && value.trim().length <= 200
            ? undefined : "La dirección debe tener entre 5 y 200 caracteres." }}>
          {(campo) => (
            <CampoCatalogo nombre={campo.name} etiqueta="Dirección de entrega" autoComplete="street-address"
              maxLength={200} valor={campo.state.value} onChange={campo.handleChange} errores={campo.state.meta.errors} />
          )}
        </form.Field>
        <form.Field name="forma_pago">
          {(campo) => (
            <label className="block space-y-1 text-sm font-medium">
              <span>Forma de pago</span>
              <select className="campo selector-catalogo" value={campo.state.value}
                onChange={(evento) => {
                  const valor = evento.target.value;
                  if (valor === "EFECTIVO" || valor === "TRANSFERENCIA") campo.handleChange(valor);
                }}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </label>
          )}
        </form.Field>
        <form.Field name="notas">
          {(campo) => <CampoCatalogo nombre={campo.name} etiqueta="Notas (opcional)" multilinea
            valor={campo.state.value} onChange={campo.handleChange} />}
        </form.Field>
      </fieldset>
      {error && <ErrorMensaje mensaje={error} />}
      <form.Subscribe selector={(estado) => estado.isSubmitting}>
        {(enviando) => (
          <button className="btn-primario" type="submit" disabled={!permitido || ocupado || enviando}>
            {ocupado || enviando ? "Confirmando…" : "Confirmar pedido"}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}
