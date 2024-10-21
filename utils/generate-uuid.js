const { customAlphabet } = require("nanoid");
const { NANOID_SEEDS } = require("../config/app.config");

module.exports = (length) => {
  const nanoid = customAlphabet(NANOID_SEEDS, (length = 21));
  return nanoid();
};
