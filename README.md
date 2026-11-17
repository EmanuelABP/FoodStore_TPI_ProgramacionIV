# Food Store — TPI Programación IV

**Tecnicatura Universitaria en Programación — UTN**

**Alumno:** Emanuel Aaron Brahim Pollini  
**Materia:** Programación IV  
**Proyecto:** Food Store — Sistema de Pedidos de Comida

## Estado del proyecto

**Etapa inicial — Base integrada de los Trabajos Prácticos de las Unidades 9 y 10.**

Este repositorio contiene el punto de partida para desarrollar el Trabajo Práctico Integrador (TPI) de Programación IV.

La versión inicial reúne:

- **Backend del TP9:** desarrollado con Python, FastAPI, SQLModel y PostgreSQL. Incluye autenticación mediante JWT en cookie HttpOnly, autorización por roles y funcionalidades de administración del catálogo.
- **Frontend del TP10:** desarrollado con React, TypeScript y Vite. Incorpora arquitectura por features, rutas protegidas, custom hooks, TanStack Query y Zustand para el estado de la interfaz.

Esta versión conserva las funcionalidades de los trabajos anteriores. **Todavía no representa la implementación definitiva del TPI ni cumple necesariamente todos sus requisitos.**

## Estructura inicial

```text
FoodStore_TPI_ProgramacionIV/
├── backend/       # Backend utilizado en el TP9
├── frontend/      # Frontend refactorizado en el TP10
├── .gitignore
└── README.md
```

## Documentación y ejecución

Cada proyecto cuenta con su propia documentación de origen:

- [Backend — README e instrucciones](backend/README.md)
- [Frontend — README e instrucciones](frontend/README.md)

Para ejecutar esta versión inicial se necesita configurar la base de datos PostgreSQL, instalar las dependencias del backend y del frontend y levantar ambos servidores siguiendo sus respectivas instrucciones.

**Nota:** las instrucciones de los subproyectos corresponden a los trabajos anteriores y podrán modificarse durante la adaptación al TPI.

## Objetivos del Trabajo Práctico Integrador

A partir de esta base se desarrollará el sistema de pedidos Food Store según la consigna oficial, incluyendo:

- Adaptación del modelo de datos al UML del TPI.
- Arquitectura backend por capas con Repository y Unit of Work.
- Gestión transaccional de pedidos y stock.
- Máquina de estados y cancelación de pedidos.
- Catálogo público, carrito de compras y checkout.
- Consulta de pedidos del cliente y panel administrativo.
- Integración, validaciones y pruebas funcionales.

La implementación se organizará en etapas, registrando avances mediante commits y tags de Git.

## Historial del desarrollo

### Etapa 0 — Base TP9 + TP10

**Tag previsto:** `base-tp9-tp10`

**Contenido:** incorporación de la base existente, sin implementar todavía las modificaciones específicas exigidas por el TPI.

**Objetivo:** conservar una referencia del estado inicial para comparar y documentar las mejoras posteriores.

Las siguientes etapas se definirán según las dependencias técnicas, las reglas de negocio y los criterios de evaluación de la consigna oficial.

---

**Repositorio:** [FoodStore_TPI_ProgramacionIV](https://github.com/EmanuelABP/FoodStore_TPI_ProgramacionIV)

**Estado:** Desarrollo inicial del TPI. Pendiente de adaptación y validación contra la consigna completa.