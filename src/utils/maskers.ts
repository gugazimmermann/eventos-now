export function maskCNPJ(value: string) {
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d{2})(\d)/, "$1.$2");
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
  value = value.replace(/(\d{4})(\d)/, "$1-$2");
  return value.slice(0, 18);
}

export function maskZipCode(value: string) {
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d{2})(\d)/, "$1.$2");
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2-$3");
  return value.slice(0, 10);
}

export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length > 10) {
    return digits
      .replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (digits.length > 6) {
    return digits
      .replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (digits.length > 2) {
    return digits
      .replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  } else {
    return digits.replace(/^(\d{0,2})/, "($1");
  }
}
