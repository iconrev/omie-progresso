module.exports.returnModelValueEntityByArray = (dataType, attrib, arrayValues, deflt = "Não Avaliado") => {
  return {
    type: dataType,
    get() {
      const rawValue = this.getDataValue(attrib)
      return arrayValues.find(x => x.id == rawValue)?.descricao ?? deflt
    }
  }
}
