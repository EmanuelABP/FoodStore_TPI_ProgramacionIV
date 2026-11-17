import { useForm } from "@tanstack/react-form";
import CampoCatalogo from "@/shared/components/CampoCatalogo";
import ModalCatalogo from "@/shared/components/ModalCatalogo";
import type { ModalProps } from "@/shared/components/ModalCatalogo";
import type { Ingrediente, IngredienteFormData } from "@/features/ingredients/types/ingrediente";

interface Props extends ModalProps {
  registro: Ingrediente | null;
  onGuardar: (datos: IngredienteFormData) => Promise<void>;
}

export default function IngredienteModal({ registro, onGuardar, ...marco }: Props) {
  const form = useForm({
    defaultValues: {
      nombre: registro?.nombre ?? "",
    },
    onSubmit: ({ value }) => onGuardar({
      nombre: value.nombre.trim(),
    }),
  });

  return (
    <ModalCatalogo titulo={registro ? "Editar ingrediente" : "Nuevo ingrediente"}
      onSubmit={() => { void form.handleSubmit(); }} {...marco}>
      <form.Field name="nombre" validators={{ onSubmit: ({ value }) => {
        if (!value.trim()) return "Ingresá un nombre.";
      } }}>
        {(campo) => (
          <CampoCatalogo nombre={campo.name} etiqueta="Nombre" valor={campo.state.value}
            onChange={campo.handleChange} errores={campo.state.meta.errors} />
        )}
      </form.Field>
    </ModalCatalogo>
  );
}
