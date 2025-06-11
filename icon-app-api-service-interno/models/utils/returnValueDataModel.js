module.exports.returnModelValueEntityByArray = (dataType, attrib, arrayValues) => {
  return {
    type: dataType,
    get() {
      const rawValue = this.getDataValue(attrib)
      return arrayValues.find(x => x.id == rawValue)?.descricao ?? "Não Avaliado"
    }
  }
}
