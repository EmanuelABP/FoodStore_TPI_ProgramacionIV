import { useForm } from "@tanstack/react-form";
import CampoCatalogo from "@/shared/components/CampoCatalogo";
import ModalCatalogo from "@/shared/components/ModalCatalogo";
import type { ModalProps } from "@/shared/components/ModalCatalogo";
import type { CategoriaCreate, CategoriaRead } from "@/features/categories/types/categoria";

interface Props extends ModalProps {
  registro: CategoriaRead | null;
  onGuardar: (datos: CategoriaCreate) => Promise<void>;
}

export default function CategoriaModal({ registro, onGuardar, ...marco }: Props) {
  const form = useForm({
    defaultValues: {
      nombre: registro?.nombre ?? "",
      descripcion: registro?.descripcion ?? "",
    },
    onSubmit: ({ value }) => onGuardar({
      nombre: value.nombre.trim(),
      descripcion: registro && value.descripcion === (registro.descripcion ?? "")
        ? registro.descripcion : value.descripcion.trim() || null,
    }),
  });

  return (
    <ModalCatalogo titulo={registro ? "Editar categoría" : "Nueva categoría"}
      onSubmit={() => { void form.handleSubmit(); }} {...marco}>
      <form.Field name="nombre" validators={{ onSubmit: ({ value }) => {
        const largo = [...value.trim()].length;
        if (largo < 2 || largo > 100) return "Ingresá un nombre de 2 a 100 caracteres.";
      } }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Nombre" valor={campo.state.value}
            onChange={campo.handleChange} errores={campo.state.meta.errors} />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Descripción (opcional)" valor={campo.state.value}
            onChange={campo.handleChange} errores={campo.state.meta.errors} multilinea />
        )}
      </form.Field>
    </ModalCatalogo>
  );
}
