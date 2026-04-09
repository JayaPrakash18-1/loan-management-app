function monthsBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  return months < 0 ? 0 : months;
}

function simpleInterest(principal, rate, months) {
  return principal * (rate / 100) * months;
}

function compoundInterest(principal, rate, months) {
  return principal * Math.pow(1 + rate / 100, months) - principal;
}

module.exports = {
  monthsBetween,
  simpleInterest,
  compoundInterest
};
