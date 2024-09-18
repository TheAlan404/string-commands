export class StringReader {
    string: string = "";
    index: number = 0;

    constructor(str: string) {
        this.string = str;
        this.reset();
    }

    reset() {
        this.index = 0;
    }

    eof() {
        return this.string.length < this.index;
    }

    readOne() {
        return this.string[this.index++];
    }

    read(count = 1) {
        let buf = "";

        while(count--) {
            if(this.eof()) break;
            buf += this.readOne();
        }

        return buf;
    }

    skipOne() {
        this.readOne();
    }

    peekOne() {
        return this.string[this.index];
    }

    rest() {
        return this.string.slice(this.index);
    }
}
