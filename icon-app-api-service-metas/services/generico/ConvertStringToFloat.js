module.exports.ConvertStringToFloat = (value) => {
  if (typeof value === "string") {
    value = value.replace("R$ ", "");

    if (value.includes(".") && value.includes(",")) {
      value = value.replace(/\./g, "");
    }
    if (value.includes(".") && !value.includes(",")) {
      const dotQuant = (value.match(/\./g) || []).length;

      for (let i = 0; i < dotQuant; i++) {
        const pos = value.indexOf(".");
        const len = value.length;
        if (len <= 3) {
          value = value.replace(/\./g, "");
        } else {
          const posDecimal = len - 3;
          if (pos < posDecimal) {
            value = value.replace(".", "");
          }
        }
      }
    }
    if (value.includes(",") && !value.includes(".")) {
      value = value.replace(",", ".");
    }

    try {
      value = parseFloat(value);
    } catch (e) {
      console.info(e);
      value = value.replace(/\./g, "");
      value = value.replace(",", ".");
    }
  }

  if (/^(-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) return Number(value);
  return NaN;
};
