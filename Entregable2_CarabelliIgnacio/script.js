// ======= STOCK, CARRITO Y OBRAS =======
let stock = JSON.parse(localStorage.getItem("stock")) || [
  {id:1, nombre:"Cemento", cantidad:100},
  {id:2, nombre:"Ladrillo", cantidad:200},
  {id:3, nombre:"Arena", cantidad:500}
];

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let obras = JSON.parse(localStorage.getItem("obras")) || [];

const stockContainer = document.getElementById("stock-container");
const carritoContainer = document.getElementById("carrito-container");
const obrasContainer = document.getElementById("obras-container");
const nuevaObraInput = document.getElementById("nueva-obra");
const agregarObraBtn = document.getElementById("agregar-obra");

const selectMaterial = document.getElementById("select-material");
const selectObra = document.getElementById("select-obra");
const cantidadAsignarInput = document.getElementById("cantidad-asignar");
const asignarBtn = document.getElementById("asignar-material");

// ======= FUNCIONES =======
function guardarDatos() {
  localStorage.setItem("stock", JSON.stringify(stock));
  localStorage.setItem("carrito", JSON.stringify(carrito));
  localStorage.setItem("obras", JSON.stringify(obras));
}

function renderStock() {
  stockContainer.innerHTML = "";
  stock.forEach(item => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${item.nombre} - Stock: ${item.cantidad} 
      <input type="number" min="1" max="${item.cantidad}" value="1" id="cantidad-${item.id}">
      <button data-id="${item.id}">Agregar al carrito</button>
    `;
    stockContainer.appendChild(div);

    div.querySelector("button").addEventListener("click", () => {
      const cantidad = parseInt(document.getElementById(`cantidad-${item.id}`).value);
      if(cantidad > 0 && cantidad <= item.cantidad){
        agregarAlCarrito(item.id, cantidad);
      }
    });
  });
}

function agregarAlCarrito(id, cantidad) {
  const item = stock.find(m => m.id === id);
  const existe = carrito.find(m => m.id === id);
  if(existe){
    if(existe.cantidad + cantidad <= item.cantidad){
      existe.cantidad += cantidad;
    } else {
      existe.cantidad = item.cantidad;
    }
  } else {
    carrito.push({id:item.id, nombre:item.nombre, cantidad:cantidad});
  }
  renderCarrito();
  actualizarSelectMaterial();
  guardarDatos();
}

function renderCarrito() {
  carritoContainer.innerHTML = "";
  carrito.forEach(item => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${item.nombre}</strong> - Cantidad: 
      <input type="number" min="1" max="${item.cantidad}" value="${item.cantidad}" id="carrito-${item.id}">
      <button data-id="${item.id}">Eliminar</button>
      <br>
      <label>Asignar a obra:</label>
      <select id="select-obra-${item.id}"></select>
      <input type="number" min="1" max="${item.cantidad}" value="1" id="cantidad-asignar-${item.id}">
      <button id="asignar-btn-${item.id}">Asignar</button>
    `;
    carritoContainer.appendChild(div);

    // Input cantidad carrito
    div.querySelector(`input[id="carrito-${item.id}"]`).addEventListener("change", (e) => {
      let nuevaCant = parseInt(e.target.value);
      const stockItem = stock.find(m => m.id === item.id);
      if(nuevaCant <= 0) nuevaCant = 1;
      if(nuevaCant > stockItem.cantidad) nuevaCant = stockItem.cantidad;
      item.cantidad = nuevaCant;
      renderCarrito();
      guardarDatos();
    });

    // Botón eliminar del carrito
    div.querySelector(`button[data-id="${item.id}"]`).addEventListener("click", () => {
      carrito = carrito.filter(m => m.id !== item.id);
      renderCarrito();
      guardarDatos();
    });

    // Llenar select de obras
    const selectObraItem = div.querySelector(`#select-obra-${item.id}`);
    obras.forEach((obra, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = obra.nombre;
      selectObraItem.appendChild(option);
    });

    // Botón asignar material a obra
    div.querySelector(`#asignar-btn-${item.id}`).addEventListener("click", () => {
      const obraIndex = parseInt(selectObraItem.value);
      const cantidadAsignar = parseInt(div.querySelector(`#cantidad-asignar-${item.id}`).value);
      const stockItem = stock.find(m => m.id === item.id);
      const obra = obras[obraIndex];

      if(isNaN(obraIndex) || isNaN(cantidadAsignar)) return;
      if(cantidadAsignar > 0 && cantidadAsignar <= item.cantidad && cantidadAsignar <= stockItem.cantidad){
        // Actualizar obra
        const existente = obra.materiales.find(m => m.id === item.id);
        if(existente){
          existente.cantidad += cantidadAsignar;
        } else {
          obra.materiales.push({id:item.id, nombre:item.nombre, cantidad:cantidadAsignar});
        }

        // Reducir stock y carrito
        stockItem.cantidad -= cantidadAsignar;
        item.cantidad -= cantidadAsignar;
        if(item.cantidad === 0){
          carrito = carrito.filter(m => m.id !== item.id);
        }

        renderStock();
        renderCarrito();
        renderObras();
        guardarDatos();
      }
    });
  });
}

function renderObras() {
  obrasContainer.innerHTML = "";
  obras.forEach((obra, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${obra.nombre}</strong>
      <ul>
        ${obra.materiales.map(m => `<li>${m.nombre} - ${m.cantidad}</li>`).join('')}
      </ul>
      <button data-index="${index}">Eliminar obra</button>
    `;
    obrasContainer.appendChild(div);

    div.querySelector("button").addEventListener("click", () => {
      obras.splice(index,1);
      renderObras();
      actualizarSelectObra();
      guardarDatos();
    });
  });
}

// ======= SELECTS PARA ASIGNAR =======
function actualizarSelectMaterial() {
  selectMaterial.innerHTML = "";
  carrito.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.nombre} - ${item.cantidad} disponibles`;
    selectMaterial.appendChild(option);
  });
}

function actualizarSelectObra() {
  selectObra.innerHTML = "";
  obras.forEach((obra, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = obra.nombre;
    selectObra.appendChild(option);
  });
}

// ======= ASIGNAR MATERIAL =======
asignarBtn.addEventListener("click", () => {
  const materialId = parseInt(selectMaterial.value);
  const obraIndex = parseInt(selectObra.value);
  const cantidadAsignar = parseInt(cantidadAsignarInput.value);

  if(isNaN(materialId) || isNaN(obraIndex) || isNaN(cantidadAsignar)) return;

  const item = carrito.find(m => m.id === materialId);
  const stockItem = stock.find(m => m.id === materialId);
  const obra = obras[obraIndex];

  if(cantidadAsignar > 0 && cantidadAsignar <= item.cantidad && cantidadAsignar <= stockItem.cantidad){
    // Actualizar obra
    const existente = obra.materiales.find(m => m.id === item.id);
    if(existente){
      existente.cantidad += cantidadAsignar;
    } else {
      obra.materiales.push({id:item.id, nombre:item.nombre, cantidad:cantidadAsignar});
    }

    // Reducir stock y carrito
    stockItem.cantidad -= cantidadAsignar;
    item.cantidad -= cantidadAsignar;
    if(item.cantidad === 0){
      carrito = carrito.filter(m => m.id !== item.id);
    }

    renderStock();
    renderCarrito();
    renderObras();
    actualizarSelectMaterial();
    actualizarSelectObra();
    guardarDatos();
  }
});

// ======= EVENTO AGREGAR OBRA =======
agregarObraBtn.addEventListener("click", () => {
  const nombre = nuevaObraInput.value.trim();
  if(nombre){
    obras.push({nombre, materiales:[]});
    nuevaObraInput.value = "";
    renderObras();
    actualizarSelectObra();
    guardarDatos();
  }
});

// ======= AGREGAR MATERIAL AL STOCK DESDE EL DOM =======
const formAgregarMaterial = document.getElementById("formAgregarMaterial");
const nombreMaterialInput = document.getElementById("nombreMaterial");
const cantidadMaterialInput = document.getElementById("cantidadMaterial");

formAgregarMaterial.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = nombreMaterialInput.value.trim();
  const cantidad = parseInt(cantidadMaterialInput.value);

  if(nombre && cantidad > 0){
    // Verificar si el material ya existe
    const existente = stock.find(m => m.nombre.toLowerCase() === nombre.toLowerCase());
    if(existente){
      existente.cantidad += cantidad;
    } else {
      // Asignamos un id único
      const nuevoId = stock.length > 0 ? Math.max(...stock.map(m => m.id)) + 1 : 1;
      stock.push({id: nuevoId, nombre, cantidad});
    }

    guardarDatos();
    renderStock();
    actualizarSelectMaterial();

    // Limpiar formulario
    formAgregarMaterial.reset();
  }
});


// ======= INICIALIZACIÓN =======
renderStock();
renderCarrito();
renderObras();
actualizarSelectMaterial();
actualizarSelectObra();
