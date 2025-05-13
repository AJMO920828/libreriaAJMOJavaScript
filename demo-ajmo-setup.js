// demo-ajmo-setup.js

const columnas = [
  { campo: "id", titulo: "ID", textAlign: "center" },
  { campo: "union", titulo: "Nombre + Email" },
  { campo: "nombre", titulo: "Nombre" },
  { campo: "email", titulo: "Correo" },
  { campo: "acciones", titulo: "Acciones", textAlign: "center" }
];

let datos = [
  { id: 1, nombre: "Erik Flores", email: "erik@mail.com" },
  { id: 2, nombre: "Ana Ruiz", email: "ana@mail.com" },
  { id: 3, nombre: "Luis Pérez", email: "luis@mail.com" },
  { id: 4, nombre: "Abel Mendoza", email: "abel@example.com" }
];

const tablaInstancia = crearTablaConPaginacion({
  contenedor: "#contenedorTabla",
  columnas,
  datos,
  filasPorPagina: 2,//El default es 5
  opcionesPorPagina: [2,5,10,20,50], // El default [5, 10, 20, 50]
  checkedList: true, //checkedList false
  selectAllAcrossPages: true, //selectAllAcrossPages false
  exportar: true, //exportar = false
  htmlExportar: '<span class="material-symbols-outlined">file_download</span> Exportar',// htmlExportar = null
  classBtnExportar: 'btn btn-success' // htmlExportar = null
});

window.obtenerSeleccionadosTabla = () => tablaInstancia.obtenerSeleccionados();

function verDetalle(item) {
  alert("Detalle: " + JSON.stringify(item));
}

function mostrarSeleccionados() {
  const seleccionados = tablaInstancia.obtenerSeleccionados();
  document.getElementById('resultadoSeleccionados').textContent = JSON.stringify(seleccionados, null, 2);
}

function llenarFormularioYContenedor() {
  const datosEjemplo = {
    nombre: "Valeria Mendoza",
    email: "valeria@example.com"
  };
  llenaFormulario(datosEjemplo, 'formulario_autollenado');
  document.getElementById('nombreContenedor').textContent = datosEjemplo.nombre;
  document.getElementById('emailContenedor').textContent = datosEjemplo.email;
}

function reemplazarTabla() {
  const nuevosDatos = [
    { id: 10, nombre: "Laura Martínez", email: "laura@example.com" },
    { id: 11, nombre: "Carlos Gómez", email: "carlos@example.com" },
    { id: 12, nombre: "Rosa Hernández", email: "rosa@example.com" }
  ];
  tablaInstancia.actualizarDatos({ nuevosDatos });
}

function ocultaCheck() {
  const btn = document.getElementById('ocultarCheck');
  const isOcultando = btn.getAttribute('data-check') === 'false';

  // Cambiar texto, clase y atributo
  btn.textContent = isOcultando ? 'Mostrar Check' : 'Ocultar Check';
  btn.classList.toggle('btn-danger', !isOcultando);
  btn.classList.toggle('btn-primary', isOcultando);
  btn.setAttribute('data-check', isOcultando ? 'true' : 'false');
  
  const btn2 = document.getElementById('ocultaSelectAllCheck');
  btn2.disabled = isOcultando;


  tablaInstancia.actualizarDatos({ checkedList: !isOcultando});
}

function ocultaSelectAllCheck() {
  const btn = document.getElementById('ocultaSelectAllCheck');
  const isOcultando = btn.getAttribute('data-check') === 'false';

  // Cambiar texto, clase y atributo
  btn.textContent = isOcultando ? 'Seleccionar todos los registros' : 'seleccionar solo los registros de la paginacion';
  btn.classList.toggle('btn-danger', !isOcultando);
  btn.classList.toggle('btn-primary', isOcultando);
  btn.setAttribute('data-check', isOcultando ? 'true' : 'false');
  tablaInstancia.actualizarDatos({ selectAllAcrossPages: !isOcultando});
}

document.getElementById('form_agregar_registro').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validarFormularioGenerico('form_agregar_registro')) return;

  const nuevo = {
    id: Date.now(),
    nombre: document.getElementById('nuevoNombre').value.trim(),
    email: document.getElementById('nuevoEmail').value.trim()
  };

  datos.push(nuevo);
  tablaInstancia.actualizarDatos({ nuevosDatos: this.datos });
  limpiarFormularioGenerico('form_agregar_registro');
});
