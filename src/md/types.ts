export type MarkdownRenderer = {
    inline: { ruler: { push: (id: string, parse: (state: State, silent: boolean) => boolean) => void } };
    renderer: { rules: Record<string, Token> };
    disable: Array<string>;
}

export type State = {
    src: { slice: (pos: unknown) => string };
    pos: unknown;
    push: (id: string, arg2: string, arg3: number) => Token;
}

export type MarkdownEnv = {}

export type Token = {
    meta: { match: unknown }
}
