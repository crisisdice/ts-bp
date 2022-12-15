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
  const EXCLUDES = ['classes', 'index.ts', 'utils.ts']
  const files = readdirSync(root)
    .filter((fl) => RegExp(pathRegex).test(fl))
    .filter((fl) => !EXCLUDES.includes(fl))

  applyToFiles(root, files, [constraint])
}

function constraint(contents: string) {
  const lines = contents.split('\n')

  const FIELDS = /const model = ([a-zA-Z]*)SequelizeModel/
  const SQ1 = /^    { sequelize }/
  const SQ2 = /^      sequelize,/

  let plural: string
  return lines
    .map((line) => {
      if (!FIELDS.test(line)) return line
      const model = getMatch(line, FIELDS)
      plural = model.at(-1) === 'y' ? `${model.slice(0, model.length -1)}ies` : `${model}s`
      return line
    })
    .map((line) => {
      if (!SQ1.test(line)) return line
      return `    { sequelize, tableName: '${plural}' }`
    })
    .map((line) => {
      if (!SQ2.test(line)) return line
      return `      sequelize,\n      tableName: '${plural}',`
    })
    .join('\n')
}

main()
