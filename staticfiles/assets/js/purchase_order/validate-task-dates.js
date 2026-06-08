function validarFechasOrdenCompra(form) {
  const startStr = $(form).find("input[name='start_date']").val();
  const endStr = $(form).find("input[name='end_date']").val();
  const arrivalStr = $(form).find("input[name='estimated_arrival']").val();

  // Si alguna fecha no está definida, no validar (deja que el required del input actúe)
  if (!startStr || !endStr || !arrivalStr) return true;

  const start = new Date(startStr);
  const end = new Date(endStr);
  const arrival = new Date(arrivalStr);

  // Si alguna fecha es inválida, no validar
  if (isNaN(start) || isNaN(end) || isNaN(arrival)) return true;

  // Fechas iguales entre sí
  if (
    start.getTime() === end.getTime() ||
    start.getTime() === arrival.getTime() ||
    arrival.getTime() === end.getTime()
  ) {
    Swal.fire({
      icon: "error",
      title: "Fechas inválidas",
      text: "Las fechas de inicio, llegada y finalización no pueden ser iguales entre sí.",
      confirmButtonText: "Aceptar",
    });
    return false;
  }

  // Inicio mayor que llegada o finalización
  if (start > arrival || start > end) {
    Swal.fire({
      icon: "error",
      title: "Fechas incorrectas",
      text: "La fecha de inicio no puede ser mayor a la fecha de llegada ni a la de finalización.",
      confirmButtonText: "Aceptar",
    });
    return false;
  }

  // Llegada mayor que finalización
  if (arrival > end) {
    Swal.fire({
      icon: "error",
      title: "Fechas incorrectas",
      text: "La fecha de llegada no puede ser mayor que la fecha de finalización.",
      confirmButtonText: "Aceptar",
    });
    return false;
  }

  // Llegada menor o igual a inicio
  if (arrival <= start) {
    Swal.fire({
      icon: "error",
      title: "Fechas incorrectas",
      text: "La fecha de llegada no puede ser menor o igual a la fecha de inicio.",
      confirmButtonText: "Aceptar",
    });
    return false;
  }

  // Finalización menor o igual a llegada o inicio
  if (end <= arrival || end <= start) {
    Swal.fire({
      icon: "error",
      title: "Fechas incorrectas",
      text: "La fecha de finalización no puede ser menor o igual a la fecha de llegada o de inicio.",
      confirmButtonText: "Aceptar",
    });
    return false;
  }

  return true;
}