import { useForm } from "@tanstack/react-form";
import type { CategoriaRead } from "@/features/categories";
import CampoCatalogo from "@/shared/components/CampoCatalogo";
import ModalCatalogo from "@/shared/components/ModalCatalogo";
import type { ModalProps } from "@/shared/components/ModalCatalogo";
import type { ProductoCreate, ProductoRead, ProductoStockUpdate } from "@/features/products/types/producto";

interface ProductoModalProps extends ModalProps {
  registro: ProductoRead | null;
  categorias: CategoriaRead[];
  cargandoCategorias: boolean;
  errorCategorias?: string;
  onGuardar: (datos: ProductoCreate) => Promise<void>;
}

function validarStock(value: string) {
  const stock = Number(value);
  if (!value.trim() || !Number.isInteger(stock) || stock < 0 || stock > 2147483647) {
    return "Ingresá un stock entero entre 0 y 2147483647.";
  }
}

export default function ProductoModal({
  registro, categorias, cargandoCategorias, errorCategorias, onGuardar, ...marco
}: ProductoModalProps) {
  const form = useForm({
    defaultValues: {
      nombre: registro?.nombre ?? "",
      descripcion: registro?.descripcion ?? "",
      precio_base: registro ? String(registro.precio_base) : "",
      imagen_url: registro?.imagen_url ?? "",
      categoria_id: registro ? String(registro.categoria_id) : "",
      stock: String(registro?.stock ?? 0),
      disponible: registro?.disponible ?? true,
    },
    onSubmit: ({ value }) => onGuardar({
      nombre: value.nombre.trim(),
      descripcion: registro && value.descripcion === (registro.descripcion ?? "")
        ? registro.descripcion : value.descripcion.trim() || null,
      precio_base: Number(value.precio_base),
      imagen_url: registro && value.imagen_url === (registro.imagen_url ?? "")
        ? registro.imagen_url : value.imagen_url.trim() || null,
      categoria_id: Number(value.categoria_id),
      stock: Number(value.stock),
      disponible: value.disponible,
    }),
  });

  const activas = categorias.filter((categoria) => categoria.activo);
  const categoriaActual = registro?.categoria;
  const mostrarActual = categoriaActual && !activas.some((categoria) => categoria.id === categoriaActual.id);

  return (
    <ModalCatalogo titulo={registro ? "Editar producto" : "Nuevo producto"}
      onSubmit={() => { void form.handleSubmit(); }} {...marco}>
      <form.Field name="nombre" validators={{ onSubmit: ({ value }) => value.trim() ? undefined : "Ingresá un nombre." }}>
        {(campo) => <CampoCatalogo nombre={campo.name} etiqueta="Nombre" valor={campo.state.value}
          onChange={campo.handleChange} errores={campo.state.meta.errors} />}
      </form.Field>
      <form.Field name="descripcion">
        {(campo) => <CampoCatalogo nombre={campo.name} etiqueta="Descripción (opcional)" valor={campo.state.value}
          onChange={campo.handleChange} errores={campo.state.meta.errors} multilinea />}
      </form.Field>
      <form.Field name="precio_base" validators={{ onSubmit: ({ value }) => {
        const precio = Number(value);
        return value.trim() && Number.isFinite(precio) && precio >= 0 ? undefined : "Ingresá un precio mayor o igual a cero.";
      } }}>
        {(campo) => <CampoCatalogo nombre={campo.name} etiqueta="Precio base" tipo="number" valor={campo.state.value}
          onChange={campo.handleChange} errores={campo.state.meta.errors} />}
      </form.Field>
      <form.Field name="imagen_url">
        {(campo) => <CampoCatalogo nombre={campo.name} etiqueta="URL de imagen (opcional)" valor={campo.state.value}
          onChange={campo.handleChange} errores={campo.state.meta.errors} />}
      </form.Field>
      <form.Field name="categoria_id" validators={{ onSubmit: ({ value }) => {
        const id = Number(value);
        if (id === registro?.categoria_id || activas.some((categoria) => categoria.id === id)) return;
        return "Seleccioná una categoría activa.";
      } }}>
        {(campo) => {
          const error = campo.state.meta.errors.find((item) => typeof item === "string");
          return (
            <div>
              <label htmlFor={campo.name} className="mb-1 block text-sm font-medium">Categoría</label>
              <select id={campo.name} value={campo.state.value}
                className="campo selector-catalogo" aria-invalid={Boolean(error)}
                onChange={(evento) => campo.handleChange(evento.target.value)}>
                <option value="" disabled>Seleccioná una categoría</option>
                {mostrarActual && <option value={categoriaActual.id} disabled>
                  {categoriaActual.nombre} {categoriaActual.activo ? "(actual)" : "(inactiva)"}
                </option>}
                {activas.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
              </select>
              {cargandoCategorias && <p role="status" className="mt-1 text-sm">Cargando categorías…</p>}
              {errorCategorias && <p role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">{errorCategorias}</p>}
              {!cargandoCategorias && !errorCategorias && activas.length === 0 && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">No hay categorías activas para asignar.</p>
              )}
              {error && <p role="alert" className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>}
            </div>
          );
        }}
      </form.Field>
      {!registro && (
        <>
          <form.Field name="stock" validators={{ onSubmit: ({ value }) => validarStock(value) }}>
            {(campo) => <CampoCatalogo nombre={campo.name} etiqueta="Stock" tipo="number" valor={campo.state.value}
              onChange={campo.handleChange} errores={campo.state.meta.errors} />}
          </form.Field>
          <form.Field name="disponible">
            {(campo) => <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={campo.state.value}
                onChange={(evento) => campo.handleChange(evento.target.checked)} /> Disponible
            </label>}
          </form.Field>
        </>
      )}
    </ModalCatalogo>
  );
}

interface StockModalProps extends ModalProps {
  registro: ProductoRead;
  onGuardar: (datos: ProductoStockUpdate) => void;
}

export function StockModal({ registro, onGuardar, ...marco }: StockModalProps) {
  const form = useForm({
    defaultValues: { stock: String(registro.stock), disponible: registro.disponible },
    onSubmit: ({ value }) => onGuardar({ stock: Number(value.stock), disponible: value.disponible }),
  });

  return (
    <ModalCatalogo titulo="Stock y disponibilidad" onSubmit={() => { void form.handleSubmit(); }} {...marco}>
      <p className="font-medium">{registro.nombre}</p>
      <form.Field name="stock" validators={{ onSubmit: ({ value }) => validarStock(value) }}>
        {(campo) => <CampoCatalogo nombre={campo.name} etiqueta="Stock" tipo="number" valor={campo.state.value}
          onChange={campo.handleChange} errores={campo.state.meta.errors} />}
      </form.Field>
      <form.Field name="disponible">
        {(campo) => <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={campo.state.value}
            onChange={(evento) => campo.handleChange(evento.target.checked)} /> Disponible
        </label>}
      </form.Field>
    </ModalCatalogo>
  );
}
