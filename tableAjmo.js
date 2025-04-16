const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'tableAjmo.css';
document.head.appendChild(link);

function renderMiniVueTemplate(templateNode, item) {
  const filtros = {
    upper: val => String(val).toUpperCase(),
    lower: val => String(val).toLowerCase(),
    capitalize: val => String(val).charAt(0).toUpperCase() + String(val).slice(1),
  };

  const clone = templateNode.cloneNode(true);

  // Reemplazo de atributos dinámicos
  clone.querySelectorAll('*').forEach(el => {
    [...el.attributes].forEach(attr => {
      if (attr.value.includes('{{')) {
        const newVal = attr.value.replace(/{{\s*(.*?)\s*}}/g, (_, expression) => {
          try {
            let [exp, filtro] = expression.split('|').map(s => s.trim());
            exp = exp.replace(/item\.(\w+)/g, (_, prop) => {
              const val = item[prop];
              return typeof val === 'string' ? `'${val}'` : val;
            });

            let result = eval(exp);
            if (filtro && filtros[filtro]) result = filtros[filtro](result);
            return result != null ? result : '';
          } catch {
            return '';
          }
        });
        el.setAttribute(attr.name, newVal);
      }
    });
  });

  // Reemplazo de {{ }} en nodos de texto
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT, null, false);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeValue.includes('{{')) {
      node.nodeValue = node.nodeValue.replace(/{{\s*(.*?)\s*}}/g, (_, expression) => {
        try {
          let [exp, filtro] = expression.split('|').map(s => s.trim());
          exp = exp.replace(/item\.(\w+)/g, (_, prop) => {
            const val = item[prop];
            return typeof val === 'string' ? `'${val}'` : val;
          });

          let result = eval(exp);
          if (filtro && filtros[filtro]) result = filtros[filtro](result);
          return result != null ? result : '';
        } catch {
          return '';
        }
      });
    }
  }

  return clone;
}


function crearTablaConPaginacion({ contenedor, columnas, datos, filasPorPagina = 10, opcionesPorPagina = [5, 10, 20, 50], checkedList = false }) {
  const wrapper = document.querySelector(contenedor);
  let paginaActual = 1;
  let columnaOrden = null;
  let ordenAscendente = true;
  let filasActuales = filasPorPagina;
  const seleccionados = new Map();

  // Guardar todas las plantillas por campo
  const plantillas = {};
  wrapper.querySelectorAll('[data-actions]').forEach(el => {
    const campo = el.getAttribute('data-actions');
    if (campo) {
      plantillas[campo] = el.cloneNode(true);;
    }
  });

  if (checkedList) {
    columnas = [{ campo: '__check', titulo: '<input type="checkbox" id="selectAll">' }, ...columnas];
  }

  wrapper.innerHTML = ''; // limpiar contenedor

  const tabla = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  tabla.className = "tabla-ajmo";
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
  byRegistro.appendChild(document.createTextNode("Registros por página:"))
  byRegistro.appendChild(selectorPaginas);
  footer.appendChild(paginador);
  footer.appendChild(byRegistro);

  wrapper.appendChild(tabla);
  wrapper.appendChild(footer);

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

    // Header
    thead.innerHTML = '';
    const trHead = document.createElement('tr');
    columnas.forEach(col => {
      const th = document.createElement('th');
      th.setAttribute('data-col', col.campo);
      if (col.style) th.setAttribute('style', col.style);
      th.className = "th-ajmo";
      th.innerHTML = col.titulo || col.campo;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // Body
    tbody.innerHTML = '';
    paginados.forEach(row => {
      const tr = document.createElement('tr');
      tr.className = "tr-ajmo";

      columnas.forEach(col => {
        const td = document.createElement('td');
        td.className = "td-ajmo";
        const plantilla = plantillas[col.campo];

        if (col.campo === '__check' && checkedList) {
          const chk = document.createElement('input');
          chk.type = 'checkbox';
          chk.className = 'rowCheck check-ajmo';
          chk.dataset.id = row.id;
          chk.checked = seleccionados.has(row.id);
          chk.addEventListener('change', () => {
            if (chk.checked) {
              seleccionados.set(row.id, row);
            } else {
              seleccionados.delete(row.id);
            }
          });
          td.appendChild(chk);

        } else if (plantilla) {
          const contenido = renderMiniVueTemplate(plantilla, row);
        
          // Enlazar eventos a botones con $event
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
        
          // ⚠️ IMPORTANTE: añadir solo el contenido INTERNO
          while (contenido.firstChild) {
            td.appendChild(contenido.firstChild);
          }
        } else {
          td.textContent = row[col.campo] ?? '';
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    // Select All
    const selectAll = thead.querySelector('#selectAll');
    if (selectAll) {
      selectAll.checked = paginados.every(d => seleccionados.has(d.id));
      selectAll.indeterminate = paginados.some(d => seleccionados.has(d.id)) && !selectAll.checked;

      selectAll.onclick = () => {
        paginados.forEach(d => {
          if (selectAll.checked) {
            seleccionados.set(d.id, d);
          } else {
            seleccionados.delete(d.id);
          }
        });
        render();
      };
    }

    // Ordenamiento
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

    // Paginación
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
  }

  function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    render();
  }

  render();

  return {
    obtenerSeleccionados: () => Array.from(seleccionados.values())
  };
}
