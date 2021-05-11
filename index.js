// String Commands

class CommandHandler {
  /**
  * Command Handler Class
  * @constructor
  * @param {object} [opts]
  * @param {string} [opts.prefix]
  */
  constructor(opts = {}) {
    this.prefix = opts.prefix || "";
    this.commands = new Map();
  }
  
  /**
  * Sets the prefix for this handler
  * @param {string} prefix
  */
  setPrefix(prefix) {
    this.prefix = typeof prefix == "string" ? prefix : "";
  }
}

module.exports = CommandHandler;
