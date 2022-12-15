import { readdirSync, readFileSync, writeFileSync } from 'fs'

const getMatch = (line: string, regex: RegExp, i = 1) => Array.from(line.match(regex))[i]

function applyToFiles(
  root: string,
  files: string[],
  callbacks: ((file: string, root?: string, path?: string) => string)[],
) {
  for (const file of files) {
    try {
      const path = `${root}/${file}`
      let contents = readFileSync(path, 'utf8')
      for (const callback of callbacks) {
        contents = callback(contents, root, file)
      }
      writeFileSync(path, contents)
    } catch (e) {
      console.log(`Error with ${file}`)
      console.log(e)
    }
  }
}

export function main() {
  const root = process.argv[2]
  const pathRegex = process.argv[3]
  const files = readdirSync(root)
    .filter((fl) => RegExp(pathRegex).test(fl))
    .filter((x) => x !== 'index.js')

  applyToFiles(root, files, [constraint])
}

function constraint(contents: string) {
  const lines = contents.split('\n')

  const FIELDS = /addConstraint\('[a-zA-Z]*', \[(.*)\], {/

  return lines
    .map((line) => {
      if (!FIELDS.test(line)) return line
      const start = line.indexOf('[')
      const fields = getMatch(line, FIELDS)
      return `${line.slice(0, start - 1)} {\n      ${line.includes('await') ? '  ' : ''}fields: [${fields}],`
    }).join('\n')
}

main()
