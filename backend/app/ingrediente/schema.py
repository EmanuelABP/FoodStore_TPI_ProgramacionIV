from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints


class IngredienteDatos(BaseModel):
    nombre: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class IngredienteRead(IngredienteDatos):
    model_config = ConfigDict(from_attributes=True)
    id: int
