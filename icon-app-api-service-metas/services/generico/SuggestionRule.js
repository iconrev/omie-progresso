let basePercent = 30

module.exports.SuggestionIncrease = () => basePercent;

module.exports.SuggestionRule = (baseValuePercentage, desc=false) => {

    let newValue

    if (!desc) {
        if (baseValuePercentage >= 50) {
            newValue = ((100 - baseValuePercentage) * (basePercent / 100)) + baseValuePercentage
        } else {
            newValue = ((100 + basePercent) / 100) * baseValuePercentage
        }
    } else {
        newValue = baseValuePercentage * ((100 - basePercent) / 100)
    }

    return newValue
}

module.exports.SuggestionIncreaseValue = (value, percentage=basePercent) => {
    return value * ((100 + percentage) / 100)
}
