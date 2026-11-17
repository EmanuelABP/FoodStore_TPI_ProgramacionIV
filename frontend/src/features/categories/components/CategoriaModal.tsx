import { useForm } from "@tanstack/react-form";
import CampoCatalogo from "@/shared/components/CampoCatalogo";
import ModalCatalogo from "@/shared/components/ModalCatalogo";
import type { ModalProps } from "@/shared/components/ModalCatalogo";
import type { Categoria, CategoriaFormData } from "@/features/categories/types/categoria";

interface Props extends ModalProps {
  registro: Categoria | null;
  onGuardar: (datos: CategoriaFormData) => Promise<void>;
}

export default function CategoriaModal({ registro, onGuardar, ...marco }: Props) {
  const form = useForm({
    defaultValues: {
      nombre: registro?.nombre ?? "",
      descripcion: registro?.descripcion ?? "",
    },
    onSubmit: ({ value }) => onGuardar({
      nombre: value.nombre.trim(),
      descripcion: value.descripcion.trim(),
    }),
  });

  return (
    <ModalCatalogo titulo={registro ? "Editar categoría" : "Nueva categoría"}
      onSubmit={() => { void form.handleSubmit(); }} {...marco}>
      <form.Field name="nombre" validators={{ onSubmit: ({ value }) => {
        if (!value.trim()) return "Ingresá un nombre.";
        if (value.trim().length > 100) return "El nombre admite hasta 100 caracteres.";
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
