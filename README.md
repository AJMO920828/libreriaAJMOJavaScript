# Tabla con Selección, Paginación y Plantillas HTML Dinámicas

Este proyecto presenta un componente de tabla construido con JavaScript puro, que ofrece funcionalidades avanzadas como:

- Selección de filas (checkbox)
- Paginación dinámica
- Ordenamiento por columnas
- Plantillas HTML embebidas usando sintaxis tipo `{{ item.prop | filtro }}`
- Estilos personalizados con CSS
- Separación por capas: lógica (JS), presentación (CSS) y estructura (HTML)

---

## 🧩 Componentes

### 1. `tableAjmo.js`

JavaScript modular que expone la función `crearTablaConPaginacion`, capaz de:

- Renderizar tablas dinámicamente con datos proporcionados
- Insertar HTML personalizado por campo desde contenedores `data-actions`
- Soportar filtros simples (`upper`, `lower`, `capitalize`)
- Gestionar selección de múltiples elementos con `checkbox`
- Crear un sistema de paginación con estilos y control
- Controlar orden ascendente/descendente al hacer clic en encabezados

#### API:

```js
crearTablaConPaginacion({
  contenedor: '#miContenedor',
  columnas: [
    { campo: 'codigoBanco', titulo: 'Codigo Banco' },
    { campo: 'cuentaCompania', titulo: 'Cuenta Compañía' },
    ...
  ],
  datos: [ ... ], // Lista de objetos
  filasPorPagina: 10,
  opcionesPorPagina: [5, 10, 20, 50],
  checkedList: true
});
```

### 2. `tableAjmo.css`

Archivo de estilos diseñado para una tabla limpia, moderna y responsive.

Incluye:

- Estilos de botones icónicos (`Material Icons`)
- Formato visual para filas alternas, ordenamiento, paginación, y selección
- Responsive y con buenos contrastes para lectura y usabilidad

### 3. `index.html`

Ejemplo de uso de la tabla con definición de plantillas embebidas y botones con eventos personalizados.