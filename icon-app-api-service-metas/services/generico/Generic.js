module.exports.formatNumber = (value, decimals=2) => {
  if (value) {
    try {
      return parseFloat(value)
        .toFixed(decimals)
        .replace(".", ",")
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    } catch (error) {
      console.info(error)
    }
  } else {
    if (decimals === 0){
      return "0"
    } else {
      return "0,00";
    }
  }
};