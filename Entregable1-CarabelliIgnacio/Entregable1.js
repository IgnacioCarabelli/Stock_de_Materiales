

// Objeto para almacenar materiales y cantidades
let stock = {};


// FUNCIONES 


// Agregar nuevo material

function agregarMaterial() {
  let nombre = prompt('Ingresa el nombre del nuevo material:');
  if (!nombre) return;

  nombre = nombre.toLowerCase();

  if (stock[nombre] !== undefined) {
    alert('Ese material ya existe. Usa la opción 2 para agregar cantidad.');
    return;
  }

  let cantidad = parseInt(prompt('Ingresa la cantidad inicial:'));
  if (isNaN(cantidad) || cantidad < 0) {
    alert('Cantidad inválida.');
    return;
  }

  stock[nombre] = cantidad;
  console.log(`Se agregó ${cantidad} unidades de "${nombre}".`);
  alert(`Se agregó ${cantidad} unidades de "${nombre}".`);
}

// Sumar o restar cantidad

function modificarStock(sumar = true) {
  let nombre = prompt('Ingresa el nombre del material:');
  if (!nombre) return;
  nombre = nombre.toLowerCase();

  if (stock[nombre] === undefined) {
    alert('El material no existe. Usa la opción 1 para crearlo.');
    return;
  }

  let cantidad = parseInt(prompt(`Ingresa la cantidad a ${sumar ? 'agregar' : 'restar'}:`));
  if (isNaN(cantidad) || cantidad <= 0) {
    alert('Cantidad inválida.');
    return;
  }

  if (!sumar && cantidad > stock[nombre]) {
    alert('No hay suficiente stock para restar esa cantidad.');
    return;
  }

  stock[nombre] += sumar ? cantidad : -cantidad;

  console.log(`Stock actualizado: ${nombre} → ${stock[nombre]} unidades.`);
  alert(`Nuevo stock de "${nombre}": ${stock[nombre]} unidades.`);
}

// Ver stock actual (todo o específico)

function verStock() {
  if (Object.keys(stock).length === 0) {
    alert('No hay materiales cargados.');
    console.log('Stock vacío.');
    return;
  }

  let verTodo = confirm('¿Queres ver TODOS los materiales? (Aceptar = Sí, Cancelar = Solo uno)');

  if (verTodo) {
    let mensaje = 'LISTADO COMPLETO DE MATERIALES:\n\n';
    for (let [material, cantidad] of Object.entries(stock)) {
      mensaje += `- ${material}: ${cantidad} unidades\n`;
    }
    alert(mensaje);
    console.log(mensaje);
  } else {
    let nombre = prompt('Ingresa el nombre del material a consultar:');
    if (!nombre) return;
    nombre = nombre.toLowerCase();

    if (stock[nombre] !== undefined) {
      alert(`Stock de "${nombre}": ${stock[nombre]} unidades.`);
      console.log(`Stock de ${nombre}: ${stock[nombre]}`);
    } else {
      alert('Ese material no está cargado.');
    }
  }
}


// MENÚ PRINCIPAL


let opcion;

do {
  opcion = prompt(`CONTROL DE STOCK DE MATERIALES
Seleccione una opción:
1 - Agregar nuevo material
2 - Agregar cantidad
3 - Restar cantidad
4 - Ver stock
5 - Salir`);

  switch (opcion) {
    case '1':
      agregarMaterial();
      break;
    case '2':
      modificarStock(true);
      break;
    case '3':
      modificarStock(false);
      break;
    case '4':
      verStock();
      break;
    case '5':
      let salir = confirm('¿Seguro que desea salir del sistema?');
      if (salir) alert('¡Hasta luego!');
      else opcion = '0'; 
      break;
    default:
      alert('Opción inválida. Ingrese un número del 1 al 5.');
      break;
  }

} while (opcion !== '5');
