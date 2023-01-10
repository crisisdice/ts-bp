

export const getMatch = (line: string, regex: RegExp, i = 1) => Array.from(line.match(regex))[i]
