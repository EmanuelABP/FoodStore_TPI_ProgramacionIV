import { useForm } from "@tanstack/react-form";
import CampoCatalogo from "@/shared/components/CampoCatalogo";
import ModalCatalogo from "@/shared/components/ModalCatalogo";
import type { ModalProps } from "@/shared/components/ModalCatalogo";
import type { Categoria } from "@/features/categories";
import type { Ingrediente } from "@/features/ingredients";
import type { Producto, ProductoFormulario } from "@/features/products/types/producto";

interface Props extends ModalProps {
  registro: Producto | null;
  ingredientes: Ingrediente[];
  cargandoIngredientes: boolean;
  errorIngredientes?: string;
  categorias: Categoria[];
  cargandoCategorias: boolean;
  errorCategorias?: string;
  onGuardar: (datos: ProductoFormulario) => Promise<void>;
}

export default function ProductoModal({
  registro, ingredientes, cargandoIngredientes, errorIngredientes,
  categorias, cargandoCategorias, errorCategorias, onGuardar, ...marco
}: Props) {
  const form = useForm({
    defaultValues: {
      nombre: registro?.nombre ?? "",
      descripcion: registro?.descripcion ?? "",
      precio_base: registro ? String(registro.precio_base) : "",
      disponible: registro?.disponible ?? true,
      ingrediente_ids: registro?.ingrediente_ids ?? [],
      categorias: (registro?.categorias ?? []).map(({ id, es_principal }) => ({ categoria_id: id, es_principal })),
    },
    onSubmit: ({ value }) => onGuardar({
      nombre: value.nombre.trim(),
      descripcion: value.descripcion.trim(),
      precio_base: Number(value.precio_base),
      disponible: value.disponible,
      imagenes_url: registro?.imagenes_url ?? [],
      ingrediente_ids: value.ingrediente_ids,
      categorias: cargandoCategorias || errorCategorias
        ? value.categorias
        : value.categorias.filter(({ categoria_id }) =>
          categorias.some(({ id, deleted_at }) => id === categoria_id && deleted_at === null)),
    }),
  });

  return (
    <ModalCatalogo titulo={registro ? "Editar producto" : "Nuevo producto"}
      onSubmit={() => { void form.handleSubmit(); }} {...marco}>
      <form.Field name="nombre" validators={{ onSubmit: ({ value }) => {
        if (!value.trim()) return "Ingresá un nombre.";
        if (value.trim().length > 150) return "El nombre admite hasta 150 caracteres.";
      } }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Nombre" valor={campo.state.value}
            onChange={campo.handleChange} errores={campo.state.meta.errors} />
        )}
      </form.Field>
      <form.Field name="descripcion" validators={{ onSubmit: ({ value }) => value.trim() ? undefined : "Ingresá una descripción." }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Descripción" valor={campo.state.value}
            onChange={campo.handleChange} errores={campo.state.meta.errors} multilinea />
        )}
      </form.Field>
      <form.Field name="precio_base" validators={{ onSubmit: ({ value }) =>
        value.trim() && Number.isFinite(Number(value)) && Number(value) >= 0
          ? undefined
          : "Ingresá un precio mayor o igual a cero.",
      }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Precio base" valor={campo.state.value}
            onChange={campo.handleChange} errores={campo.state.meta.errors} tipo="number" />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(campo) => (
          <label className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
            <input type="checkbox" checked={campo.state.value}
              onChange={(evento) => campo.handleChange(evento.target.checked)} />
            Disponible
          </label>
        )}
      </form.Field>
      <form.Field name="categorias">
        {(campo) => {
          const seleccionadas = campo.state.value;
          const opciones = categorias.filter((categoria) => categoria.deleted_at === null);
          // Mantiene visibles las asociaciones actuales mientras se carga la lista.
          if (cargandoCategorias || errorCategorias) {
            for (const categoria of registro?.categorias ?? []) {
              if (!opciones.some(({ id }) => id === categoria.id)) opciones.push(categoria);
            }
          }

          return (
            <fieldset className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <legend className="px-1 text-sm font-medium text-slate-800 dark:text-slate-200">Categorías</legend>
              {cargandoCategorias && <p role="status" className="text-sm">Cargando categorías…</p>}
              {errorCategorias && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{errorCategorias}</p>}
              {!cargandoCategorias && !errorCategorias && opciones.length === 0 && (
                <p className="text-sm text-slate-600 dark:text-slate-300">No hay categorías disponibles.</p>
              )}
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {opciones.map(({ id, nombre }) => (
                  <label key={id} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                    <input type="checkbox" checked={seleccionadas.some(({ categoria_id }) => categoria_id === id)}
                      onChange={(evento) => campo.handleChange(evento.target.checked
                        ? [...seleccionadas, { categoria_id: id, es_principal: false }]
                        : seleccionadas.filter(({ categoria_id }) => categoria_id !== id))} />
                    {nombre}
                  </label>
                ))}
              </div>
              {seleccionadas.length > 0 && (
                <label className="block text-sm text-slate-800 dark:text-slate-200">
                  Categoría principal
                  <select className="categoria-principal mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-600"
                    value={seleccionadas.find(({ es_principal }) => es_principal)?.categoria_id ?? ""}
                    onChange={(evento) => {
                      const principal = Number(evento.target.value);
                      campo.handleChange(seleccionadas.map((categoria) => ({
                        ...categoria, es_principal: categoria.categoria_id === principal,
                      })));
                    }}>
                    <option value="">Sin principal</option>
                    {opciones.filter(({ id }) => seleccionadas.some(({ categoria_id }) => categoria_id === id))
                      .map(({ id, nombre }) => <option key={id} value={id}>{nombre}</option>)}
                  </select>
                </label>
              )}
            </fieldset>
          );
        }}
      </form.Field>
      <form.Field name="ingrediente_ids">
        {(campo) => {
          const opciones = ingredientes.map(({ id, nombre }) => ({ id, nombre }));
          if (!cargandoIngredientes && !errorIngredientes) {
            for (const id of campo.state.value) {
              if (!ingredientes.some((ingrediente) => ingrediente.id === id)) {
                opciones.push({ id, nombre: `Ingrediente #${id} (dado de baja)` });
              }
            }
          }

          return (
            <fieldset className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <legend className="px-1 text-sm font-medium text-slate-800 dark:text-slate-200">Ingredientes</legend>
              {cargandoIngredientes && <p role="status" className="text-sm">Cargando ingredientes…</p>}
              {errorIngredientes && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{errorIngredientes}</p>}
              {!cargandoIngredientes && !errorIngredientes && opciones.length === 0 && (
                <p className="text-sm text-slate-600 dark:text-slate-300">No hay ingredientes registrados.</p>
              )}
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {opciones.map(({ id, nombre }) => (
                  <label key={id} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                    <input type="checkbox" checked={campo.state.value.includes(id)}
                      onChange={(evento) => campo.handleChange(evento.target.checked
                        ? [...campo.state.value, id]
                        : campo.state.value.filter((seleccionado) => seleccionado !== id))} />
                    {nombre}
                  </label>
                ))}
              </div>
            </fieldset>
          );
        }}
      </form.Field>
    </ModalCatalogo>
  );
}
