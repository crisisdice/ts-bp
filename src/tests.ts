import { readdirSync, readFileSync, writeFileSync } from 'fs'

//const getMatch = (line: string, regex: RegExp, i = 1) => Array.from(line.match(regex))[i]

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
  const FS = "fastify = require('../../dist/server')"
  // const IMP = "{ Episode }"
  // const CR = "Episode.create"
  return contents
    .replaceAll(FS, `${FS}.default`)
    // .replaceAll(IMP, '{ EpisodeSequelizeModel }')
    // .replaceAll(CR, 'EpisodeSequelizeModel.create')
}

main()
