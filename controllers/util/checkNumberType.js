module.exports = (type, value) => {
  if (type === "required") return !(value > -1) || isNaN(Number(value));
  else if (type === "optional") return value && isNaN(Number(value));
  return true;
};
