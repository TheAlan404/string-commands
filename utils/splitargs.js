/**
 * Split into args, written by elgs
 * @author https://github.com/elgs
 * @param {*} input
 * @param {*} sep
 * @param {*} keepQuotes
 * @returns
 */

export default function splitargs(input, sep, keepQuotes) {
	let separator = sep || /\s/g;
	let singleQuoteOpen = false;
	let doubleQuoteOpen = false;
	let tokenBuffer = [];
	let ret = [];

	let arr = input.split("");
	for (let i = 0; i < arr.length; ++i) {
		let element = arr[i];
		let matches = element.match(separator);
		if (element === "'" && !doubleQuoteOpen) {
			if (keepQuotes === true) {
				tokenBuffer.push(element);
			}
			singleQuoteOpen = !singleQuoteOpen;
			continue;
		} else if (element === '"' && !singleQuoteOpen) {
			if (keepQuotes === true) {
				tokenBuffer.push(element);
			}
			doubleQuoteOpen = !doubleQuoteOpen;
			continue;
		}

		if (!singleQuoteOpen && !doubleQuoteOpen && matches) {
			if (tokenBuffer.length > 0) {
				ret.push(tokenBuffer.join(""));
				tokenBuffer = [];
			} else if (!!sep) {
				ret.push(element);
			}
		} else {
			tokenBuffer.push(element);
		}
	}
	if (tokenBuffer.length > 0) {
		ret.push(tokenBuffer.join(""));
	} else if (!!sep) {
		ret.push("");
	}
	return ret;
}
