import { readdirSync, unlinkSync, readFileSync, writeFileSync } from 'fs'

function applyToFiles(paths: string[], callbacks: ((file: string, path?: string) => string)[]) {
  for (const path of paths) {
    try {
      let file = readFileSync(path, 'utf8')
      for (const callback of callbacks) {
        file = callback(file, path)
      }
      unlinkSync(path)
      writeFileSync(path.replace('.js', '.ts'), file)
    } catch (e) {
      console.log(`Error with ${path}`)
      console.log(e)
    }
  }
}

export function main() {
  const path = process.argv[2]
  const pathRegex = process.argv[3]
  const files = readdirSync(path)
    .filter((fl) => RegExp(pathRegex).test(fl))
    .map((fl) => `${path}/${fl}`)

  applyToFiles(files, [toImport, replacements])
}

function toImport(contents: string) {
  function toImportLine(line: string) {
    return line.replace('const', 'import').replace(' = require(', ' from ').replace(')', '')
  }

  const lines = contents.split('\n')

  const REQUIRE = /= require/
  const MULTI_LINE_REQUIRE = /^[^{]*\} = require.*/
  const CONST = /const \{/

  let lastConst = -1

  return lines
    .reduce((requires, line, index) => {
      if (CONST.test(line)) lastConst = index
      if (!REQUIRE.test(line)) return [...requires, line]
      if (MULTI_LINE_REQUIRE.test(line)) requires[lastConst] = toImportLine(requires[lastConst])
      return [...requires, toImportLine(line)]
    }, [])
    .join('\n')
}

function createModel(contents: string, path: string) {
  const model = ''

  const matchRelations = () => [{ name: '', type: '' }]
  const relations = matchRelations().map(({ name, type }) => `declare ${name}: ${type};`)

  const matchKeys = () => ['']
  const keys = matchKeys().map((name) => `declare ${name}: ForeignKey<number>;`)

  const matchHasManys = () => ['']
  const hasManys = matchHasManys().map((name) => `declare ${name}: HasMany<${model}>;`)

  const matchBelongsTos = () => ['']
  const belongsTos = matchBelongsTos().map((name) => `declare ${name}: BelongsTo<${model}>;`)

  const imps: string[] = []

  const md = `import { ${imps.join(', ')} } from '../utils';

     export class ${model} extends ModelBase<${model}> {
       ${relations.join('\n')}

       ${keys.join('\n')}

       ${hasManys.join('\n')}

       ${belongsTos.join('\n')}
     }
    `

  // TODO
  writeFileSync(md, path)

  return contents
}

function replacements(contents: string) {
  const lines = contents.split('\n')

  const getFirstMatch = (line: string, regex: RegExp) => Array.from(line.match(regex))[1]

  const modelsToImport: string[] = []

  const MODEL = /models\./
  const MATCH = /models\.(\w+)/

  const EXPORTS = /module.exports = function define(.*)\(sequelize, DataTypes\) {/
  const DEFINE = /const .* = sequelize.define\(/
  const ASSC = /associate/
  const END_INIT = /\}\);/
  const END = /\},/

  let model: string
  let hasAssociate = false

  let MODEL_REGEX: RegExp

  const rp = lines
    .map((line) => {
      if (!MODEL.test(line)) return line
      modelsToImport.push(getFirstMatch(line, MATCH))
      return line.replace('models.', '')
    })
    .map((line) => {
      if (!EXPORTS.test(line)) return line
      model = getFirstMatch(line, EXPORTS)
      MODEL_REGEX = new RegExp(`return ${model}`)
      console.log(MODEL_REGEX)
      return `export function define${model}({ sequelize, DataTypes }: DefinitionArgs) {`
    })
    .map((line) => {
      if (!DEFINE.test(line)) return line
      return `  const model = ${model}.init({ ...common,`
    })
    .map((line) => {
      if (!ASSC.test(line)) return line
      hasAssociate = true
      return '  const associate = () => {'
    })
    .map((line, index) => {
      if (!END_INIT.test(line)) return line
      if (!END.test(lines[index - 1])) return line
      return '}, { sequelize });'
    })
    .map((line) => {
      if (!MODEL_REGEX.test(line)) return line
      return hasAssociate ? 'return { model, associate }' : 'return { model }'
    })

  const imp = `import { ${[model, ...modelsToImport].join(', ')} } from './classes'`
  return ["import { DefinitionArgs, common } from './utils'", imp, ...rp].join('\n')
}

main()
