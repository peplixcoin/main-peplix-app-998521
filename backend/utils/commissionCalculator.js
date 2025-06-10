const calculateCommission = (relativeLevel, packageAmount) => {
    let commission = 0;

    if (relativeLevel === 0) {
        commission = packageAmount * 0.10;
    }

    return parseFloat(commission.toFixed(2));
};

module.exports = calculateCommission;