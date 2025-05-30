/**
 * 
 * Formulario
 */

function pintarErrorManual(idCampo, mensaje) {
  const campo = document.getElementById(idCampo);
  if (!campo) return;

  const contenedor = campo.parentElement;

  campo.classList.remove('is-invalid');
  const anterior = contenedor.querySelector('.invalid-feedback');
  if (anterior) anterior.remove();

  const error = document.createElement('div');
  error.className = 'invalid-feedback';
  error.textContent = mensaje;
  error.style.display = 'block';
  contenedor.appendChild(error);
  campo.classList.add('is-invalid');
}

function limpiarErrorManual(idCampo) {
  const campo = document.getElementById(idCampo);
  if (!campo) return;
  campo.classList.remove('is-invalid');
  const contenedor = campo.parentElement;
  const feedback = contenedor.querySelector('.invalid-feedback');
  if (feedback) feedback.remove();
}

function validarCampo(campo) {
  const tipo = campo.type;
  const tag = campo.tagName.toLowerCase();
  const valor = campo.value.trim();
  const requerido = campo.hasAttribute('required');
  const pattern = campo.getAttribute('pattern');
  const dependeDe = campo.getAttribute('data-depends-on');
  const dependeValor = campo.getAttribute('data-depends-value');
  const contenedor = campo.parentElement;

  campo.classList.remove('is-invalid');
  const feedbackExistente = contenedor.querySelector('.invalid-feedback');
  if (feedbackExistente) feedbackExistente.remove();

  const crearMensaje = (mensaje) => {
    let error = document.createElement('div');
    error.className = 'invalid-feedback';
    error.textContent = mensaje;
    error.style.display = 'block';
    contenedor.appendChild(error);
    campo.classList.add('is-invalid');
  };

  if (dependeDe) {
    const campoPadre = document.getElementById(dependeDe);
    if (campoPadre && campoPadre.value !== dependeValor) return true;
  }

  if (requerido && (!valor || (tipo === 'checkbox' && !campo.checked))) {
    crearMensaje(campo.getAttribute('msg-error-required') || 'Este campo es obligatorio.');
    return false;
  }

  if (campo.getAttribute('msg-error-number') && valor && isNaN(valor)) {
    crearMensaje(campo.getAttribute('msg-error-number'));
    return false;
  }

  if (tipo === 'email' && valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
    crearMensaje(campo.getAttribute('msg-error-email') || 'Correo inválido.');
    return false;
  }

  if (pattern && valor && !new RegExp(pattern).test(valor)) {
    crearMensaje(campo.getAttribute('msg-error-pattern') || 'Formato inválido.');
    return false;
  }

  if (tag === 'select' && requerido && valor === '') {
    crearMensaje(campo.getAttribute('msg-error-required') || 'Selecciona una opción.');
    return false;
  }

  if (tipo === 'date' && requerido && !valor) {
    crearMensaje(campo.getAttribute('msg-error-required') || 'Selecciona una fecha válida.');
    return false;
  }

  if (tipo === 'file' && requerido && campo.files.length === 0) {
    crearMensaje(campo.getAttribute('msg-error-required') || 'Selecciona un archivo.');
    return false;
  }

  if (tipo === 'file' && campo.files.length > 0 && campo.hasAttribute('data-max-size')) {
    const maxSize = parseInt(campo.getAttribute('data-max-size'));
    const archivo = campo.files[0];
    if (archivo.size > maxSize) {
      crearMensaje(campo.getAttribute('msg-error-size') || 'Archivo demasiado grande.');
      return false;
    }
  }

  return true;
}

function validarFormularioGenerico(formId) {
  let esValido = true;
  const form = document.getElementById(formId);
  const campos = form.querySelectorAll('input, select, textarea');
  const radiosAgrupados = {};
  const checkboxesAgrupados = {};

  campos.forEach(campo => {
    if (campo.type === 'checkbox' && campo.name && form.querySelectorAll(`input[type="checkbox"][name="${campo.name}"]`).length > 1) {
      if (!checkboxesAgrupados[campo.name]) {
        checkboxesAgrupados[campo.name] = form.querySelectorAll(`input[type="checkbox"][name="${campo.name}"]`);
      }
      return;
    }
    if (campo.type === 'radio') {
      if (!radiosAgrupados[campo.name]) {
        radiosAgrupados[campo.name] = form.querySelectorAll(`input[name="${campo.name}"]`);
      }
      return;
    }
    const valido = validarCampo(campo);
    if (!valido) esValido = false;
  });

  for (const grupo in radiosAgrupados) {
    const opciones = radiosAgrupados[grupo];
    const algunoMarcado = Array.from(opciones).some(r => r.checked);
    const agrupador = opciones[0].closest('.group') || opciones[0].parentElement;

    agrupador.querySelectorAll('.invalid-feedback').forEach(e => e.remove());
    opciones.forEach(r => r.classList.remove('is-invalid'));

    if (!algunoMarcado) {
      const error = document.createElement('div');
      error.className = 'invalid-feedback';
      error.textContent = opciones[0].getAttribute('msg-error-required') || 'Selecciona una opción.';
      error.style.display = 'block';
      agrupador.appendChild(error);
      opciones.forEach(r => r.classList.add('is-invalid'));
      esValido = false;
    }
  }
  for (const grupo in checkboxesAgrupados) {
    const opciones = checkboxesAgrupados[grupo];
    const cantidadMarcados = Array.from(opciones).filter(cb => cb.checked).length;
    const minRequired = parseInt(opciones[0].getAttribute('data-min-required') || '1', 10);
    const maxAllowed = opciones[0].hasAttribute('data-max-required')
      ? parseInt(opciones[0].getAttribute('data-max-required'), 10)
      : Infinity;
  
    const agrupador = opciones[0].closest('.group') || opciones[0].parentElement;
    agrupador.querySelectorAll('.invalid-feedback').forEach(e => e.remove());
    opciones.forEach(cb => cb.classList.remove('is-invalid'));
  
    if (cantidadMarcados < minRequired) {
      const error = document.createElement('div');
      error.className = 'invalid-feedback';
      error.textContent =
        opciones[0].getAttribute('msg-error-required') ||
        `Selecciona al menos ${minRequired} opción(es).`;
      error.style.display = 'block';
      agrupador.appendChild(error);
      opciones.forEach(cb => cb.classList.add('is-invalid'));
      esValido = false;
    } else if (cantidadMarcados > maxAllowed) {
      const error = document.createElement('div');
      error.className = 'invalid-feedback';
      error.textContent =
        opciones[0].getAttribute('msg-error-max') ||
        `No puedes seleccionar más de ${maxAllowed} opción(es).`;
      error.style.display = 'block';
      agrupador.appendChild(error);
      opciones.forEach(cb => cb.classList.add('is-invalid'));
      esValido = false;
    }
  }

    // Validación de grupos data-group
  const grupos = {};
  campos.forEach(campo => {
    const grupo = campo.getAttribute('data-group');
    if (grupo) {
      if (!grupos[grupo]) grupos[grupo] = [];
      grupos[grupo].push(campo);
    }
  });

  for (const grupo in grupos) {
    const camposGrupo = grupos[grupo];
    const algunoLleno = camposGrupo.some(c => c.value.trim());
    const agrupador = camposGrupo[0].closest('.group') || camposGrupo[0].parentElement;

    agrupador.querySelectorAll('.invalid-feedback').forEach(e => e.remove());
    camposGrupo.forEach(c => c.classList.remove('is-invalid'));

    if (!algunoLleno) {
      const error = document.createElement('div');
      error.className = 'invalid-feedback';
      error.textContent = camposGrupo[0].getAttribute('msg-error-required') || 'Llena al menos un campo del grupo.';
      error.style.display = 'block';
      agrupador.appendChild(error);
      camposGrupo.forEach(c => c.classList.add('is-invalid'));
      esValido = false;
    }
  }


  return esValido;
}

function limpiarFormularioGenerico(formId) {
  const form = document.getElementById(formId);
  form.reset();
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
}

function inicializarValidaciones(formId) {
  const form = document.getElementById(formId);

  form.addEventListener('submit', function (e) {
    if (!validarFormularioGenerico(formId)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  const observarCampos = () => {
    const campos = form.querySelectorAll('input, select, textarea');
    campos.forEach(campo => {
      if (!campo.hasAttribute('data-valid-listener')) {
        campo.addEventListener('blur', () => validarCampo(campo));
        campo.addEventListener('keyup', () => validarCampo(campo));
        campo.addEventListener('change', () => {
          validarCampo(campo);

          if (campo.type === 'radio') {
            const grupo = campo.name;
            const opciones = form.querySelectorAll(`input[name="${grupo}"]`);
            const agrupador = campo.closest('.group') || campo.parentElement;
            agrupador.querySelectorAll('.invalid-feedback').forEach(e => e.remove());
            opciones.forEach(r => r.classList.remove('is-invalid'));
          }
        });
        campo.setAttribute('data-valid-listener', 'true');
      }
    });
  };

  observarCampos();

  const observer = new MutationObserver(observarCampos);
  observer.observe(form, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', () => {
  const formularios = document.querySelectorAll('form[validate]');
  formularios.forEach(form => inicializarValidaciones(form.id));
});


function llenaFormulario(data, idFormulario) {
  const form = document.getElementById(idFormulario);
  if (!form) {
    console.warn(`Formulario con id "${idFormulario}" no encontrado.`);
    return;
  }

  Object.entries(data).forEach(([key, value]) => {
    const campo = form.querySelector(`[name="${key}"]`);
    if (!campo) return;

    const tag = campo.tagName.toLowerCase();
    const tipo = campo.type;

    if (tag === 'input') {
      if (tipo === 'checkbox' || tipo === 'radio') {
        campo.checked = !!value;
      } else {
        campo.value = value;
      }
    } else if (tag === 'select' || tag === 'textarea') {
      campo.value = value;
    }
  });
}

function renderizarFormulario(idFormulario, itemData) {
  const form = document.getElementById(idFormulario);
  if (!form) return;

  const contexto = { item: itemData };

  form.innerHTML = form.innerHTML.replace(/{{\s*(.*?)\s*}}/g, (match, expression) => {
    try {
      const fn = new Function('item', `with (item) { return (${expression}); }`);
      const resultado = fn(contexto);
      return resultado != null ? escapeHTML(resultado) : '';
    } catch (error) {
      console.warn('Error evaluando expresión:', expression, error);
      return '';
    }
  });

  // Evita inyección HTML (XSS)
  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

/**
 * Recupera los valores de un formulario o un contenedor. Se requiere el identificador del contenedor para obtener los valores entrantes del contenedor.
 * @param {*} idContenedor 
 * @returns Regresa el objeto obtenido
 */
function obtenerValoresFormulario(idContenedor) {
  const contenedor = document.getElementById(idContenedor);
  const campos = contenedor.querySelectorAll('input[data-model], select[data-model], textarea[data-model]');
  const resultado = {};

  campos.forEach(campo => {
    const tipoDato = (campo.getAttribute('data-tipo-dato') || 'string').toLowerCase();
    const key = campo.getAttribute('data-model');
    const tipo = campo.type;

    let valor;

    if (tipo === 'checkbox') {
      if (!resultado[key]) {
        resultado[key] = [];
      }
      if (campo.checked) {
        valor = convertirTipo(campo.value, tipoDato);
        resultado[key].push(valor);
      }
    } else if (tipo === 'radio') {
      if (campo.checked) {
        valor = convertirTipo(campo.value, tipoDato);
        resultado[key] = valor;
      } else if (!(key in resultado)) {
        resultado[key] = null;
      }
    } else {
      valor = convertirTipo(campo.value, tipoDato);
      resultado[key] = valor;
    }
  });

  return resultado;
}

/**
 * Convierte el valor de entrada al tipo de dato especificado
 * @param {string} valor 
 * @param {string} tipoDato 
 * @returns valor convertido
 */
function convertirTipo(valor, tipoDato) {
  switch (tipoDato) {
    case 'entero':
    case 'int':
      const intVal = parseInt(valor, 10);
      return isNaN(intVal) ? null : intVal;

    case 'double':
    case 'float':
      const floatVal = parseFloat(valor);
      return isNaN(floatVal) ? null : floatVal;

    case 'boolean':
      if (valor === 'true' || valor === '1' || valor === 'on') return true;
      if (valor === 'false' || valor === '0' || valor === 'off') return false;
      return null;

    case 'string':
    default:
      return valor;
  }
}


/**
 * 
 * 
 * Tooltips
 * 
 */
document.addEventListener("DOMContentLoaded", function () {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip-ajmo";
  document.body.appendChild(tooltip);

  const mostrarTooltip = (el) => {
    const msg = el.getAttribute("tooltip-msg") || "";
    const html = el.getAttribute("tooltip-html");
    let pos = el.getAttribute("tooltip-posicion") || "arriba";

    tooltip.innerHTML = html || msg;
    tooltip.style.opacity = 1;

    // primero, render temporal para obtener tamaño real
    tooltip.style.left = "-9999px";
    tooltip.style.top = "-9999px";
    tooltip.style.display = "block";

    const rect = el.getBoundingClientRect();
    const ttRect = tooltip.getBoundingClientRect();

    // reposicionamiento dinámico si no cabe en el viewport
    const espacio = {
      arriba: rect.top,
      abajo: window.innerHeight - rect.bottom,
      izquierda: rect.left,
      derecha: window.innerWidth - rect.right,
    };

    if (pos === "arriba" && espacio.arriba < ttRect.height + 10) pos = "abajo";
    else if (pos === "abajo" && espacio.abajo < ttRect.height + 10) pos = "arriba";
    else if (pos === "izquierda" && espacio.izquierda < ttRect.width + 10) pos = "derecha";
    else if (pos === "derecha" && espacio.derecha < ttRect.width + 10) pos = "izquierda";

    let top = 0, left = 0;

    switch (pos) {
      case "abajo":
        top = rect.bottom + window.scrollY + 8;
        left = rect.left + window.scrollX + rect.width / 2 - ttRect.width / 2;
        break;
      case "arriba":
        top = rect.top + window.scrollY - ttRect.height - 8;
        left = rect.left + window.scrollX + rect.width / 2 - ttRect.width / 2;
        break;
      case "izquierda":
        top = rect.top + window.scrollY + rect.height / 2 - ttRect.height / 2;
        left = rect.left + window.scrollX - ttRect.width - 8;
        break;
      case "derecha":
      default:
        top = rect.top + window.scrollY + rect.height / 2 - ttRect.height / 2;
        left = rect.right + window.scrollX + 8;
        break;
    }

    tooltip.style.top = `${Math.max(top, 0)}px`;
    tooltip.style.left = `${Math.max(left, 0)}px`;
  };

  const ocultarTooltip = () => {
    tooltip.style.opacity = 0;
    tooltip.style.display = "none";
  };

  document.querySelectorAll("[tooltip]").forEach(el => {
    el.addEventListener("mouseenter", () => mostrarTooltip(el));
    el.addEventListener("mouseleave", ocultarTooltip);
    el.addEventListener("focus", () => mostrarTooltip(el));
    el.addEventListener("blur", ocultarTooltip);
  });
});









/**
 * 
 * 
 * TABLA
 */
function crearTablaConPaginacion({
  contenedor,
  columnas,
  datos,
  filasPorPagina = 10,
  opcionesPorPagina = [5, 10, 20, 50],
  checkedList = false,
  selectAllAcrossPages = false,
  exportar = false,
  htmlExportar = null,
  classBtnExportar = null,
  classTable = null,
  classTbody = null,
  classThead = null,
  classTh = null,
  classTd = null,
  classTrHead = null,
  classTrBody = null
}) {
  datos.forEach(item => {
    if (item.id === undefined) {
      item.id = numeroConMilisegundos();
    }
  });

  const wrapper = document.querySelector(contenedor);
  let paginaActual = 1;
  let columnaOrden = null;
  let ordenAscendente = true;
  let _checkedList = checkedList;
  let _selectAllAcrossPages = selectAllAcrossPages;
  let filasActuales = filasPorPagina;
  const seleccionados = new Map();
  const nodosPlantillaPorFila = new Map();

  const filtros = {
    upper: val => String(val).toUpperCase(),
    lower: val => String(val).toLowerCase(),
    capitalize: val => String(val).charAt(0).toUpperCase() + String(val).slice(1),
  };

  const plantillas = {};
  wrapper.querySelectorAll('[data-actions]').forEach(el => {
    const campo = el.getAttribute('data-actions');
    if (campo) {
      plantillas[campo] = el.cloneNode(true);
    }
  });

  // Asegura que la columna de selección solo esté si _checkedList es verdadero
  const tieneColumnaCheck = columnas.some(col => col.campo === '__check');
  if (_checkedList && !tieneColumnaCheck) {
    columnas = [{ campo: '__check', titulo: '<input type="checkbox" id="selectAll">' }, ...columnas];
  } else if (!_checkedList && tieneColumnaCheck) {
    columnas = columnas.filter(col => col.campo !== '__check');
  }

  wrapper.innerHTML = '';

  const tabla = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  tabla.className = "tabla-ajmo " + classTable != null ? classTable : '';
  thead.className =  classThead != null ? classThead : '';
  tbody.className =  classTbody != null ? classTbody : '';

  tabla.appendChild(thead);
  tabla.appendChild(tbody);

  const footer = document.createElement('div');
  footer.className = 'tabla-footer';

  const paginador = document.createElement('div');
  paginador.className = 'paginacion';

  const selectorPaginas = document.createElement('select');
  opcionesPorPagina.forEach(n => {
    const option = document.createElement('option');
    option.value = n;
    option.textContent = `${n}`;
    if (n === filasPorPagina) option.selected = true;
    selectorPaginas.appendChild(option);
  });

  selectorPaginas.addEventListener('change', e => {
    filasActuales = parseInt(e.target.value);
    paginaActual = 1;
    render();
  });

  const byRegistro = document.createElement('div');
  byRegistro.className = 'byPagina';
  byRegistro.appendChild(document.createTextNode("Registros por página:"));
  byRegistro.appendChild(selectorPaginas);
  footer.appendChild(paginador);
  footer.appendChild(byRegistro);

  wrapper.appendChild(tabla);
  wrapper.appendChild(footer);

  if (exportar) {
    const btnExport = document.createElement('button');
    btnExport.className = classBtnExportar || 'btn btn-outline-success btn-exportar btn-sm';
    btnExport.innerHTML = htmlExportar || '📤 Exportar CSV';
    btnExport.type = 'button';
    btnExport.onclick = () => exportarCSV();
    wrapper.appendChild(btnExport);
  }

  function renderMiniVueTemplate(templateNode, item) {
    const clone = templateNode.cloneNode(true);

    clone.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(attr => {
        if (attr.value.includes('{{')) {
          el.setAttribute(`data-tpl-${attr.name}`, attr.value);
        }
      });
    });

    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT, null, false);
    const nodosParaReemplazar = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeValue.includes('{{')) {
        nodosParaReemplazar.push(node);
      }
    }

    nodosParaReemplazar.forEach(node => {
      const fragment = document.createDocumentFragment();
      const partes = node.nodeValue.split(/({{.*?}})/g);
      partes.forEach(part => {
        if (part.startsWith('{{') && part.endsWith('}}')) {
          const span = document.createElement('span');
          span.setAttribute('data-tpl', part.trim());
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(part));
        }
      });
      node.parentNode.replaceChild(fragment, node);
    });
    clone.querySelectorAll('[data-tpl]').forEach(el => procesarElemento(el, item));
    
    clone.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(attr => {
        if (attr.name.startsWith('data-tpl-')) {
          procesarElemento(el, item); // aplica también atributos como data-tpl-title, data-tpl-href, etc.
        }
      });
    });

    return clone;
  }

  function refrescarTabla() {
    nodosPlantillaPorFila.forEach((nodos, rowId) => {
      const item = datos.find(d => d.id == rowId);
      if (!item) return;

      nodos.forEach(el => {
        const tpl = el.getAttribute('data-tpl');
        if (tpl) el.textContent = renderExpresion(tpl, item);

        [...el.attributes].forEach(attr => {
          if (attr.name.startsWith('data-tpl-')) {
            const realAttr = attr.name.replace('data-tpl-', '');
            el.setAttribute(realAttr, renderExpresion(attr.value, item));
          }
        });
      });
    });
  }

  function render() {
    let datosOrdenados = [...datos];
    if (columnaOrden && columnaOrden !== '__check') {
      datosOrdenados.sort((a, b) => {
        const valA = a[columnaOrden];
        const valB = b[columnaOrden];
        return ordenAscendente
          ? valA > valB ? 1 : -1
          : valA < valB ? 1 : -1;
      });
    }

    const inicio = (paginaActual - 1) * filasActuales;
    const paginados = datosOrdenados.slice(inicio, inicio + filasActuales);

    // Asegura que la columna de selección solo esté si _checkedList es verdadero
    const tieneColumnaCheck = columnas.some(col => col.campo === '__check');
    if (_checkedList && !tieneColumnaCheck) {
      columnas = [{ campo: '__check', titulo: '<input type="checkbox" id="selectAll">' }, ...columnas];
    } else if (!_checkedList && tieneColumnaCheck) {
      columnas = columnas.filter(col => col.campo !== '__check');
    }

    thead.innerHTML = '';
    const trHead = document.createElement('tr');
    trHead.className =  classTrHead != null ? classTrHead : '';
    columnas.forEach(col => {
      const th = document.createElement('th');
      th.className =  classTh != null ? classTh : '';
      th.setAttribute('data-col', col.campo);
      let thStyle = col.style || '';
      if (col.textAlign) {
        thStyle += `;text-align:${col.textAlign}`;
      }
      if (thStyle) th.setAttribute('style', thStyle);
      th.className = "th-ajmo";
      th.innerHTML = col.titulo || col.campo;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    tbody.innerHTML = '';
    if (paginados.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = columnas.length;
      td.className = 'td-ajmo sin-registros';
      td.style.textAlign = 'center';
      td.textContent = '⚠️ No hay registros para mostrar';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    paginados.forEach(row => {
      const tr = document.createElement('tr');
      tr.className = "tr-ajmo" + classTrBody!= null ? classTrBody : '';
      const nodosTpl = [];

      columnas.forEach(col => {
        const td = document.createElement('td');
        td.className = "td-ajmo" + classTd != null ? classTd : '';
        if (col.textAlign) td.style.textAlign = col.textAlign;

        const plantilla = plantillas[col.campo];
        if (col.campo === '__check' && _checkedList) {
          const chk = document.createElement('input');
          chk.type = 'checkbox';
          chk.className = 'rowCheck check-ajmo';
          chk.dataset.id = row.id;
          chk.checked = seleccionados.has(row.id);
          chk.addEventListener('change', () => {
            if (chk.checked) seleccionados.set(row.id, row);
            else seleccionados.delete(row.id);
          });
          td.appendChild(chk);

        } else if (plantilla) {
          const contenido = renderMiniVueTemplate(plantilla, row);
          const botones = contenido.querySelectorAll('button[onclick]');
          botones.forEach(btn => {
            const original = btn.getAttribute('onclick');
            const fnMatch = original && original.match(/^(\w+)\(\$event\)$/);
            if (fnMatch) {
              const nombreFuncion = fnMatch[1];
              btn.removeAttribute('onclick');
              btn.addEventListener('click', () => {
                if (typeof window[nombreFuncion] === 'function') {
                  window[nombreFuncion](row);
                }
              });
            }
          });

          while (contenido.firstChild) {
            td.appendChild(contenido.firstChild);
          }

          // Agrega todos los nodos con data-tpl
          td.querySelectorAll('[data-tpl]').forEach(n => nodosTpl.push(n));

          // Revisa todos los nodos por si tienen atributos que empiezan con data-tpl-
          td.querySelectorAll('*').forEach(el => {
            [...el.attributes].forEach(attr => {
              if (attr.name.startsWith('data-tpl-')) {
                nodosTpl.push(el);
              }
            });
          });
        } else {
          td.textContent = row[col.campo] ?? '';
        }

        tr.appendChild(td);
      });

      nodosPlantillaPorFila.set(row.id, nodosTpl);
      tbody.appendChild(tr);
    });

    const selectAll = thead.querySelector('#selectAll');
    if (selectAll) {
      selectAll.checked = paginados.every(d => seleccionados.has(d.id));
      selectAll.indeterminate = paginados.some(d => seleccionados.has(d.id)) && !selectAll.checked;

      selectAll.onclick = () => {
        const targetData = _selectAllAcrossPages ? datos : paginados;
        targetData.forEach(d => {
          if (selectAll.checked) seleccionados.set(d.id, d);
          else seleccionados.delete(d.id);
        });
        render();
      };
    }

    thead.querySelectorAll('th').forEach(th => {
      const col = th.getAttribute('data-col');
      th.classList.remove('sort-asc', 'sort-desc');
      if (col === columnaOrden) {
        th.classList.add(ordenAscendente ? 'sort-asc' : 'sort-desc');
      }

      if (col !== '__check') {
        th.onclick = () => {
          columnaOrden = col === columnaOrden ? columnaOrden : col;
          ordenAscendente = col !== columnaOrden || !ordenAscendente;
          render();
        };
      }
    });

    const totalPaginas = Math.ceil(datosOrdenados.length / filasActuales);
    paginador.innerHTML = '';
    const crearBoton = (icon, onClick, disabled) => {
      const btn = document.createElement('button');
      btn.disabled = disabled;
      btn.innerHTML = `<span class="material-icons">${icon}</span>`;
      btn.onclick = onClick;
      return btn;
    };

    paginador.appendChild(crearBoton('first_page', () => cambiarPagina(1), paginaActual === 1));
    paginador.appendChild(crearBoton('chevron_left', () => cambiarPagina(paginaActual - 1), paginaActual === 1));
    const info = document.createElement('span');
    info.className = 'info-pagina';
    info.textContent = `Página ${paginaActual} de ${totalPaginas}`;

    paginador.appendChild(info);
    paginador.appendChild(crearBoton('chevron_right', () => cambiarPagina(paginaActual + 1), paginaActual === totalPaginas));
    paginador.appendChild(crearBoton('last_page', () => cambiarPagina(totalPaginas), paginaActual === totalPaginas));

    const vistaInfo = document.createElement('span');
    vistaInfo.className = 'info-vista';
    const inicioVista = inicio + 1;
    const finVista = Math.min(inicio + filasActuales, datosOrdenados.length);
    vistaInfo.textContent = `${inicioVista} a ${finVista} de ${datosOrdenados.length}`;
    paginador.appendChild(vistaInfo);

    if (typeof activarTooltipsAJMO === 'function') {
      activarTooltipsAJMO();
    }
  }

  function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    render();
  }

  function exportarCSV() {
    const camposExportables = columnas.filter(c => c.campo !== '__check');
    const datosAExportar = seleccionados.size > 0 ? Array.from(seleccionados.values()) : datos;
    if (datosAExportar.length === 0) {
      alert("⚠️ No hay datos para exportar.");
      return;
    }
    const encabezados = camposExportables.map(c => `"${c.titulo || c.campo}"`);
    const filas = datosAExportar.map(row =>
      camposExportables
        .map(col => `"${(row[col.campo] ?? '').toString().replace(/"/g, '""')}"`)
        .join(',')
    );
    const contenido = [encabezados.join(','), ...filas].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = seleccionados.size > 0 ? 'seleccionados.csv' : 'tabla.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  render();

  return {
    obtenerSeleccionados: () => Array.from(seleccionados.values()),
    refrescarTabla,
    actualizarDatos: ({ nuevosDatos, checkedList, selectAllAcrossPages }) => {
      if (nuevosDatos) {
        datos.length = 0;
        nuevosDatos.forEach(d => {
          if (d.id === undefined) d.id = numeroConMilisegundos();
          datos.push(d);
        });

        // ⚠️ Limpieza necesaria
        seleccionados.clear();
        nodosPlantillaPorFila.clear();
      }

      if (checkedList != null) {
        _checkedList = checkedList;
      }

      if (selectAllAcrossPages != null) {
        _selectAllAcrossPages = selectAllAcrossPages;
      }

      paginaActual = 1;
      render();
    }
  };
}

function renderExpresion(template, item) {
  try {
    return template.replace(/{{\s*(.*?)\s*}}/g, (_, expression) => {
      let exp = expression;
      let filtro = null;

      if (expression.includes('|')) {
        [exp, filtro] = expression.split('|').map(e => e.trim());
      }

      let result = new Function('item', `with(item){ return ${exp}; }`)(item);

      const filtros = {
        upper: val => String(val).toUpperCase(),
        lower: val => String(val).toLowerCase(),
        capitalize: val => {
          const s = String(val);
          return s.charAt(0).toUpperCase() + s.slice(1);
        }
      };

      if (filtro && filtros[filtro]) {
        result = filtros[filtro](result);
      }

      return result ?? '';
    });
  } catch (err) {
    console.warn('Error evaluando expresión:', err);
    return '';
  }
}

function numeroConMilisegundos(min = 0, max = 9999) {
  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  const millis = new Date().getMilliseconds();
  return `${random}${millis}`;
}

function procesarElemento(el, item) {
  const tpl = el.getAttribute('data-tpl');
  if (tpl) el.textContent = renderExpresion(tpl, item);

  [...el.attributes].forEach(attr => {
    if (attr.name.startsWith('data-tpl-')) {
      const realAttr = attr.name.replace('data-tpl-', '');
      el.setAttribute(realAttr, renderExpresion(attr.value, item));
    }
  });
}

function activarTooltipsAJMO() {
  const tooltip = document.querySelector(".tooltip-ajmo");
  if (!tooltip) return;

  document.querySelectorAll("[tooltip]").forEach(el => {
    // Elimina eventos anteriores si los hubiera
    el.removeEventListener("mouseenter", el._tooltipEnter);
    el.removeEventListener("mouseleave", el._tooltipLeave);
    el.removeEventListener("focus", el._tooltipEnter);
    el.removeEventListener("blur", el._tooltipLeave);

    const mostrar = () => {
      const msg = el.getAttribute("tooltip-msg") || "";
      const html = el.getAttribute("tooltip-html");
      let pos = el.getAttribute("tooltip-posicion") || "arriba";

      tooltip.innerHTML = html || msg;
      tooltip.style.opacity = 1;

      tooltip.style.left = "-9999px";
      tooltip.style.top = "-9999px";
      tooltip.style.display = "block";

      const rect = el.getBoundingClientRect();
      const ttRect = tooltip.getBoundingClientRect();

      const espacio = {
        arriba: rect.top,
        abajo: window.innerHeight - rect.bottom,
        izquierda: rect.left,
        derecha: window.innerWidth - rect.right,
      };

      if (pos === "arriba" && espacio.arriba < ttRect.height + 10) pos = "abajo";
      else if (pos === "abajo" && espacio.abajo < ttRect.height + 10) pos = "arriba";
      else if (pos === "izquierda" && espacio.izquierda < ttRect.width + 10) pos = "derecha";
      else if (pos === "derecha" && espacio.derecha < ttRect.width + 10) pos = "izquierda";

      let top = 0, left = 0;

      switch (pos) {
        case "abajo":
          top = rect.bottom + window.scrollY + 8;
          left = rect.left + window.scrollX + rect.width / 2 - ttRect.width / 2;
          break;
        case "arriba":
          top = rect.top + window.scrollY - ttRect.height - 8;
          left = rect.left + window.scrollX + rect.width / 2 - ttRect.width / 2;
          break;
        case "izquierda":
          top = rect.top + window.scrollY + rect.height / 2 - ttRect.height / 2;
          left = rect.left + window.scrollX - ttRect.width - 8;
          break;
        case "derecha":
        default:
          top = rect.top + window.scrollY + rect.height / 2 - ttRect.height / 2;
          left = rect.right + window.scrollX + 8;
          break;
      }

      tooltip.style.top = `${Math.max(top, 0)}px`;
      tooltip.style.left = `${Math.max(left, 0)}px`;
    };

    const ocultar = () => {
      tooltip.style.opacity = 0;
      tooltip.style.display = "none";
    };

    el._tooltipEnter = mostrar;
    el._tooltipLeave = ocultar;

    el.addEventListener("mouseenter", mostrar);
    el.addEventListener("mouseleave", ocultar);
    el.addEventListener("focus", mostrar);
    el.addEventListener("blur", ocultar);
  });
}
