// ======= SIMULACIÓN DE DATOS REMOTOS =======
const cargarStockRemoto = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exito = true;
      if (exito) {
        resolve([
          { id: 1, nombre: "Cemento", cantidad: 100 },
          { id: 2, nombre: "Ladrillo", cantidad: 200 },
          { id: 3, nombre: "Arena", cantidad: 500 }
        ]);
      } else {
        reject(new Error("Error al cargar el stock"));
      }
    }, 1500);
  });
};

// ======= STOCK, CARRITO Y OBRAS =======
let stock = [];
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

async function inicializarStock() {
  try {
    const stockLocal = JSON.parse(localStorage.getItem("stock"));
    if (stockLocal) {
      stock = stockLocal;
    } else {
      stock = await cargarStockRemoto();
      localStorage.setItem("stock", JSON.stringify(stock));
    }
    Toastify({
      text: "Stock cargado correctamente",
      gravity: "bottom",
      position: "right",
      style: { background: "green" }
    }).showToast();
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  } finally {
    renderStock();
    renderCarrito();
    renderObras();
    actualizarSelectMaterial();
    actualizarSelectObra();
  }
}

// ======= RENDER STOCK =======
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
      if(cantidad <= 0 || cantidad > item.cantidad){
        Swal.fire("Cantidad inválida", `Debes ingresar entre 1 y ${item.cantidad}`, "warning");
        return;
      }
      agregarAlCarrito(item.id, cantidad);
    });
  });
}

// ======= AGREGAR AL CARRITO =======
function agregarAlCarrito(id, cantidad) {
  const item = stock.find(m => m.id === id);
  const existe = carrito.find(m => m.id === id);
  if(existe){
    if(existe.cantidad + cantidad <= item.cantidad){
      existe.cantidad += cantidad;
    } else {
      Swal.fire("Error", `No puedes agregar más de ${item.cantidad} unidades de ${item.nombre}`, "error");
      return;
    }
  } else {
    carrito.push({id: item.id, nombre: item.nombre, cantidad: cantidad});
  }
  renderCarrito();
  actualizarSelectMaterial();
  guardarDatos();
  Toastify({
    text: `${cantidad} ${item.nombre} agregado al carrito`,
    gravity: "bottom",
    position: "right",
    style: { background: "blue" }
  }).showToast();
}

// ======= RENDER CARRITO =======
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
    div.querySelector(`#carrito-${item.id}`).addEventListener("change", (e) => {
      let nuevaCant = parseInt(e.target.value);
      const stockItem = stock.find(m => m.id === item.id);
      if(nuevaCant <= 0) nuevaCant = 1;
      if(nuevaCant > stockItem.cantidad){
        Swal.fire("Cantidad inválida", `Máximo disponible: ${stockItem.cantidad}`, "warning");
        nuevaCant = stockItem.cantidad;
      }
      item.cantidad = nuevaCant;
      renderCarrito();
      guardarDatos();
    });

    // Botón eliminar del carrito con confirmación
    div.querySelector(`button[data-id="${item.id}"]`).addEventListener("click", () => {
      Swal.fire({
        title: "¿Eliminar del carrito?",
        text: `Se eliminará ${item.nombre} del carrito`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
      }).then(result => {
        if(result.isConfirmed){
          carrito = carrito.filter(m => m.id !== item.id);
          renderCarrito();
          actualizarSelectMaterial();
          guardarDatos();
          Swal.fire("Eliminado", `${item.nombre} eliminado del carrito`, "success");
        }
      });
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

      if(cantidadAsignar <= 0){
        Swal.fire("Cantidad inválida", "Debes asignar al menos 1 unidad", "warning");
        return;
      }
      if(cantidadAsignar > item.cantidad || cantidadAsignar > stockItem.cantidad){
        Swal.fire("Error", `No puedes asignar más de ${Math.min(item.cantidad, stockItem.cantidad)} unidades`, "error");
        return;
      }

      const existente = obra.materiales.find(m => m.id === item.id);
      if(existente){
        existente.cantidad += cantidadAsignar;
      } else {
        obra.materiales.push({id:item.id, nombre:item.nombre, cantidad:cantidadAsignar});
      }

      stockItem.cantidad -= cantidadAsignar;
      item.cantidad -= cantidadAsignar;
      if(item.cantidad === 0){
        carrito = carrito.filter(m => m.id !== item.id);
      }

      renderStock();
      renderCarrito();
      renderObras();
      guardarDatos();

      Toastify({
        text: `${cantidadAsignar} ${item.nombre} asignado a ${obra.nombre}`,
        gravity: "bottom",
        position: "right",
        style: { background: "green" }
      }).showToast();
    });
  });
}

// ======= RENDER OBRAS =======
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
      Swal.fire({
        title: "¿Eliminar obra?",
        text: `Se eliminará la obra ${obra.nombre}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
      }).then(result => {
        if(result.isConfirmed){
          obras.splice(index,1);
          renderObras();
          actualizarSelectObra();
          guardarDatos();
          Swal.fire("Eliminado", `Obra ${obra.nombre} eliminada`, "success");
        }
      });
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

// ======= ASIGNAR MATERIAL DESDE SELECT GENERAL =======
asignarBtn.addEventListener("click", () => {
  const materialId = parseInt(selectMaterial.value);
  const obraIndex = parseInt(selectObra.value);
  const cantidadAsignar = parseInt(cantidadAsignarInput.value);

  if(isNaN(materialId) || isNaN(obraIndex) || isNaN(cantidadAsignar)) return;

  const item = carrito.find(m => m.id === materialId);
  const stockItem = stock.find(m => m.id === materialId);
  const obra = obras[obraIndex];

  if(cantidadAsignar <= 0){
    Swal.fire("Cantidad inválida", "Debes asignar al menos 1 unidad", "warning");
    return;
  }
  if(cantidadAsignar > item.cantidad || cantidadAsignar > stockItem.cantidad){
    Swal.fire("Error", `No puedes asignar más de ${Math.min(item.cantidad, stockItem.cantidad)} unidades`, "error");
    return;
  }

  const existente = obra.materiales.find(m => m.id === item.id);
  if(existente){
    existente.cantidad += cantidadAsignar;
  } else {
    obra.materiales.push({id:item.id, nombre:item.nombre, cantidad:cantidadAsignar});
  }

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

  Toastify({
    text: `${cantidadAsignar} ${item.nombre} asignado a ${obra.nombre}`,
    gravity: "bottom",
    position: "right",
    style: { background: "green" }
  }).showToast();
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
    Toastify({
      text: `Obra ${nombre} creada`,
      gravity: "bottom",
      position: "right",
      style: { background: "purple" }
    }).showToast();
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

  if(!nombre || cantidad <= 0){
    Swal.fire("Error", "Debes completar todos los campos correctamente", "error");
    return;
  }

  const existente = stock.find(m => m.nombre.toLowerCase() === nombre.toLowerCase());
  if(existente){
    existente.cantidad += cantidad;
  } else {
    const nuevoId = stock.length > 0 ? Math.max(...stock.map(m => m.id)) + 1 : 1;
    stock.push({id: nuevoId, nombre, cantidad});
  }

  guardarDatos();
  renderStock();
  actualizarSelectMaterial();
  formAgregarMaterial.reset();

  Swal.fire("Material agregado", `${cantidad} ${nombre} agregado al stock`, "success");
});

// ======= INICIALIZACIÓN =======
inicializarStock();
