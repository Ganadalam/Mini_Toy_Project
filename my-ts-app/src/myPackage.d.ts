interface Config {
    url: string
}

declare module "myPackage" {
    function init(config: Config): boolean;
    function exit(code: number): number;
}

export function init(): void;
export function exit(): void;