// String Commands

/**
 * @typedef {Object} HandlerOptions
 * @property {string} prefix The prefix for the handler.
 */

module.exports = class CommandHandler {
  /**
  * Command Handler Class
  * @constructor
  * @param {HandlerOptions} opts
  */
  constructor(opts = {}) {
    this.prefix = typeof opts.prefix === 'string' ? opts.prefix : "";
    this.commands = new Map();
  }
  
  /**
  * Sets the prefix for this handler
  * @param {string} prefix The new prefix.
  */
  setPrefix(prefix) {
    this.prefix = typeof prefix === "string" ? prefix : "";
	return this;
  }
}