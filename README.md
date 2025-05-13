# 🧩 Librería AJMO - Componentes Dinámicos para Web

Este proyecto es una demostración de la **librería AJMO**, que provee funcionalidades dinámicas para formularios, tablas con paginación, tooltips personalizados y lógica de plantillas estilo mini-Vue.

## 🛠️ Tecnologías utilizadas

- HTML5
- JavaScript (ES6+)
- [Bootstrap 5.3](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- jQuery 3.6 (solo para compatibilidad mínima)
- `ajmo.js`: librería personalizada

---

## ⚙️ Funcionalidades incluidas

### 1. Validación de formularios

- Campos obligatorios (`required`)
- Validación de email, número, patrón (`pattern`)
- Agrupación de `radio` y `checkbox` con mensajes personalizados
- Soporte para campos dependientes (`data-depends-on`)
- Validación de tamaño máximo de archivos (`data-max-size`)
- Validación dinámica al escribir (`blur`, `keyup`, `change`)

```html
<input type="email" name="correo" required msg-error-email="Correo inválido">
```

### 2. Tooltips Personalizados

- Se activan con el atributo `tooltip`
- Soporta posiciones: `arriba`, `abajo`, `izquierda`, `derecha`

```html
<button tooltip tooltip-msg="Texto del tooltip" tooltip-posicion="arriba">Hover aquí</button>
```

### 3. Tabla Dinámica con Paginación

- Paginación configurable
- Ordenamiento por columna
- Columnas dinámicas con plantillas HTML usando `{{item.prop}}`
- Filtros disponibles: `upper`, `lower`, `capitalize`
- Checkbox por fila y botón "Seleccionar todo"
- Exportación a CSV

```javascript
crearTablaConPaginacion({
  contenedor: "#contenedorTabla",
  columnas: [
    { campo: "nombre", titulo: "Nombre" },
    { campo: "email", titulo: "Correo" },
    { campo: "acciones", titulo: "Acciones" }
  ],
  datos: [{ id: 1, nombre: "Erik", email: "erik@mail.com" }],
  filasPorPagina: 5,
  checkedList: true,
  exportar: true
});
```

### 4. Llenado automático de formularios

```javascript
llenaFormulario({ nombre: "Juan", email: "juan@mail.com" }, 'formulario_demo');
```

### 5. Lógica condicional dentro de la tabla

```html
<div data-actions="union" data-item="item" style="display: none;">
  <span>{{item.nombre}} - {{item.email}}</span>
  <span tooltip tooltip-msg="Correo empresarial">
    {{item.email.includes('example.com') ? '📧' : ''}}
  </span>
</div>
```

---

## 📁 Estructura del Proyecto

```
/
├── index.html           # Página principal de ejemplo
├── ajmo.js              # Librería JavaScript con toda la lógica
├── ajmo.css             # Estilos para tabla, tooltips, validación
├── tableAjmo.css        # (opcional) Tema de la tabla
└── README.md            # Documentación del proyecto
```

---

## 🚀 Cómo empezar

1. Clona o descarga el proyecto.
2. Asegúrate de tener un servidor local (como Live Server).
3. Abre `index.html` en tu navegador.

---

## ✨ Personalización

- Puedes definir tus propias expresiones dentro de `data-actions`.
- La función `actualizarDatos()` permite actualizar la tabla sin recargar.
- Compatible con `template-like` expressions en HTML (`{{ }}`) sin frameworks externos.

---

## 🧪 Demo interactiva

Incluye ejemplos visuales para:

- Validar formularios
- Interactuar con registros seleccionados
