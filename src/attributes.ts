import { readFileSync, writeFileSync } from 'fs'

function applyToFiles(files: string[], callbacks: ((file: string) => string)[]) {
  for (const file of files) {
    try {
      const path = `${__dirname}/${file}`
      let contents = readFileSync(path, 'utf8')
      for (const callback of callbacks) {
        contents = callback(contents)
      }
      writeFileSync(path.replace('.d.ts', '.json'), contents)
    } catch (e) {
      console.log(`Error with ${file}`)
      console.log(e)
    }
  }
}

export function main() {
  applyToFiles(['index.d.ts'], [toImport])
}

function toImport(contents: string) {
  const getFirstMatch = (line: string, regex: RegExp) => Array.from(line.match(regex))[1]

  const lines = contents.split('\n')

  const MODEL = /export type (.*) = {/
  const FK = /(Id|createdBy|updatedBy)/
  const COMMON = /(id|updatedAt|createdAt)/

  let modelName: string | null = null

  return JSON.stringify(
    lines.reduce((models, line) => {
      if (!!modelName && line === '}') {
        modelName = null
      }

      if (!!modelName) {
        let txt = line.trim()

        if (FK.test(line)) txt = txt.replace('number', 'ForeignKey<number>')

        if (!COMMON.test(line)) models[modelName].push(txt)
      }

      if (MODEL.test(line)) {
        const str = getFirstMatch(line, MODEL)
        modelName = (str.at(-1) === 's' ? str.slice(0, str.length - 1) : str)
          .replace('Statu', 'Status')
          .replace('Categorie', 'Category')
          .replace('Countrie', 'Country')
          .replace('AnalyticsMausValue', 'AnalyticsMausValues')
        models[modelName] = []
      }

      return models
    }, {} as Record<string, string[]>),
    null,
    2,
  )
}

main()
