import { readdirSync, readFileSync, writeFileSync } from 'fs'
import MODELS from './index.json'

const getMatch = (line: string, regex: RegExp, i = 1) => Array.from(line.match(regex))[i]

const snakeToCamel = (str: string) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))

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
      //unlinkSync(path)
      //writeFileSync(path.replace('.js', '.ts'), contents)
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

  applyToFiles(root, files, [createModel])
  //applyToFiles(root, files, [toImport, replacements])
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

function createModel(contents: string, root: string, path: string) {
  const EXPORTS = /module.exports = function define(.*)\(sequelize, DataTypes\) {/

  const lines = contents.split('\n')

  const model = getMatch(
    lines.find((l) => EXPORTS.test(l)),
    EXPORTS,
  ) as keyof typeof MODELS

  const HAS_MANY = new RegExp(`${model}\.([A-Z\_]*) = ${model}\.hasMany`)
  const BELONGS_TO = new RegExp(`${model}\.([A-Z\_]*) = ${model}\.belongsTo`)
  const ASSC = new RegExp(`${model}\.([A-Z]*) = ${model}\..*\\(models\.([a-zA-Z]*)\,`)

  const attrb = MODELS[model]
    .filter((a) => !a.includes('ForeignKey'))
    .map((name) => `declare ${name};`)
  const keys = MODELS[model]
    .filter((a) => a.includes('ForeignKey'))
    .map((name) => `declare ${name}`)

  const modelImps = []

  const associations = lines
    .filter((l) => ASSC.test(l))
    .map((asc) => {
      const name = snakeToCamel(getMatch(asc, ASSC))
      const ascModel = getMatch(asc, ASSC, 2)
      const suffix = name.at(-1) === 's' ? '[]' : ''

      modelImps.push(ascModel)

      const declaration = `declare ${name}?: NonAttribute<${ascModel}Plain${suffix}>;`
      const type = `${name}?: ${ascModel}${suffix}`

      return { declaration, type }
    })

  const hasManys = lines
    .filter((l) => HAS_MANY.test(l))
    .map((l) => getMatch(l, HAS_MANY))
    .map((name) => `declare static ${name}: HasMany<${model}>;`)

  const belongsTos = lines
    .filter((l) => BELONGS_TO.test(l))
    .map((l) => getMatch(l, BELONGS_TO))
    .map((name) => `declare static ${name}: BelongsTo<${model}>;`)

  const seqImps = ['InferAttributes']

  if (hasManys.length) seqImps.push('HasMany')
  if (belongsTos.length) seqImps.push('BelongsTo')
  if (keys.length) seqImps.push('ForeignKey')
  if (associations.length) seqImps.push('NonAttribute')

  const utilImps = ['ModelBase', 'Plain']

  if (attrb.join('').includes('JsonValue')) utilImps.push('JsonValue')

  const md = `
      ${seqImps.length ? `import { ${seqImps.join(', ')} } from 'sequelize';` : ''}
      ${utilImps.length ? `import { ${utilImps.join(', ')} } from '../utils';` : ''}
      ${modelImps.length ? `import { ${modelImps.filter((ip, i, s) => s.indexOf(ip) === i).filter(x => x !== model).join('Plain, ')} } from '.';` : ''}

     export class ${model} extends ModelBase<${model}> {
       ${attrb.sort().join('\n')}

       ${keys.sort().join('\n')}

       ${hasManys.sort().join('\n')}

       ${belongsTos.sort().join('\n')}

       ${associations.sort().map(x => x.declaration).join('\n')}
     }

     export type ${model}Plain = Plain<${model}> 
    `

  writeFileSync(`${root}/classes/${path.replace('.js', '.ts')}`, md)

  return contents
}

function replacements(contents: string) {
  const lines = contents.split('\n')

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
      modelsToImport.push(getMatch(line, MATCH))
      return line.replace('models.', '')
    })
    .map((line) => {
      if (!EXPORTS.test(line)) return line
      model = getMatch(line, EXPORTS)
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
    .map((line) => {
      return line.includes('use strict') ? '' : line
    })

  const imps = [model, ...modelsToImport].filter((ip, i, s) => s.indexOf(ip) === i)
  const imp = `import { ${imps.join(', ')} } from './classes'`
  return ["import { DefinitionArgs, common } from './utils'", imp, ...rp].join('\n')
}

main()
