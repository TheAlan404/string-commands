class StringReader {
    input: string = "";
    index: number = 0;

    constructor(input: string) {
        this.input = input;
    }

    reset() {
        this.index = 0;
    }

    readChar() {
        return this.input[this.index++];
    }

    peekChar() {
        return this.input[this.index];
    }

    readUntil(predicate: ((char: string) => boolean) | string): string {
        if(typeof predicate == "string") {
            let str: string = predicate;
            predicate = (x) => x == str;
        };

        let buf = "";

        while(!this.end()) {
            let char = this.readChar();
            if(predicate(char)) {
                return buf;
            } else {
                buf += char;
            };
        };

        return "";
    }

    readLine() {
        return this.readUntil('\n');
    }

    end() {
        return this.index >= this.input.length;
    }
}

export default StringReader;