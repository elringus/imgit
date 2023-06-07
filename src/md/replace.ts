import { inherits } from "node:util";
import { MarkdownEnv, MarkdownRenderer, State, Token } from "./types";

let id = 0;

export function Replace(regexp: RegExp, replace: (match: string[], env: MarkdownEnv) => string) {
    let self: any = (md: MarkdownRenderer) => {
        self.init(md);
    };
    self.__proto__ = Replace.prototype;
    self.regexp = new RegExp("^" + regexp.source, regexp.flags);
    self.replace = replace;
    self.id = `md-replacer-${id}`;
    id++;
    return self;
}

inherits(Replace, Function);

// noinspection JSUnusedGlobalSymbols
Replace.prototype.init = function (md: MarkdownRenderer) {
    md.inline.ruler.push(this.id, this.parse.bind(this));
    md.renderer.rules[this.id] = this.render.bind(this);
};

Replace.prototype.parse = function (state: State, silent: boolean) {
    let match = this.regexp.exec(state.src.slice(state.pos));
    if (!match) return false;

    state.pos += match[0].length;
    if (silent) return true;

    let token = state.push(this.id, "", 0);
    token.meta = { match: match };
    return true;
};

Replace.prototype.render = function (tokens: Record<string, Token>, id: string, options: never, env: MarkdownEnv) {
    return this.replace(tokens[id].meta.match, env);
};
