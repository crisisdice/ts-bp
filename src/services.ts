import { readdirSync, unlinkSync, readFileSync, writeFileSync } from 'fs'

const getFirstMatch = (line: string, regex: RegExp) => Array.from(line.match(regex))[1]

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
      unlinkSync(path)
      writeFileSync(path.replace('.js', '.ts'), contents)
    } catch (e) {
      console.log(`Error with ${file}`)
      console.log(e)
    }
  }
}

export function main() {
  const root = process.argv[2]
  const pathRegex = process.argv[3]
  const files = readdirSync(root).filter((fl) => RegExp(pathRegex).test(fl))

  //applyToFiles(root, files, [createModel])
  applyToFiles(root, files, [toImport, replacements])
}

function toImport(contents: string) {
  function toImportLine(line: string) {
    return line.replace('const', 'import').replace(' = require(', ' from ').replace(')', '')
  }

  const lines = contents.split('\n')

  const REQUIRE = /= require/
  const MULTI_LINE_REQUIRE = /^[^{]*\} = require.*/
  const CONST = /const \{/
  const DEBUG = /debug = require/

  let lastConst = -1

  return lines
    .reduce((requires, line, index) => {
      line = line.replace('Sequelize,', '')
      line = line.replace('Sequelize ', '')
      if (CONST.test(line)) lastConst = index
      if (!REQUIRE.test(line) || DEBUG.test(line)) return [...requires, line]
      if (MULTI_LINE_REQUIRE.test(line)) {
        requires[lastConst] = toImportLine(requires[lastConst])
      }
      return [...requires, toImportLine(line)]
    }, [])
    .join('\n')
}

function replacements(contents: string) {
  const lines = contents.split('\n')

  const modelsToImport: string[] = []

  const MODEL = /models\./
  const MATCH = /models\.(\w+)/

  const EXPORTS = /exports\.[a-zA-Z]* = (.*)/

  const DEBUG = /debug = require/
  const SERVICE = /Service from/
  const Op = /Op/

  const FUNC = /function .*\(.*\)/

  const CREATE = /create\((.*)\)/
  const UPDATE = /update\(.*\{(.*)\}\)/

  const ERR = /err\.name/

  let createIndex: number
  let create: string
  let created = false

  let updateIndex: number
  let update: string
  let updated = false

  const TRANS = /let transaction/
  const TRANS_TYPE = /typeof transactiontypeof transaction !== 'undefined'/

  let hasTransaction = false

  const types = (str: string) => { 
    str = str
      .replaceAll('Id,', 'Id: number,')
      .replaceAll('Id ', 'Id: number ')
      .replaceAll('Id)', 'Id: number)')
      .replaceAll('Ids,', 'Ids: number[],')
      .replaceAll('Ids)', 'Ids: number[])')
      .replaceAll('By', 'By: number')
      .replaceAll('name', 'name: string')
      .replaceAll('isActive', 'isActive: boolean')
      .replaceAll('ordinal', 'ordinal: number')
      .replaceAll('omittedAttributes', 'omittedAttributes: string[]')
      .replaceAll('configuration', 'configuration: JsonValue') 
      .replaceAll('uid', 'uid: string') 
      .replaceAll('hash', 'hash: string') 
      .replaceAll('ids', 'ids: number[]') 
      .replaceAll('now', 'Date') 
    return str.includes('Valid') || str.includes('ids') || str.includes('uid') || str.includes('idOrIds') ? str : str.replace('id', 'id: number')
  }

  const rp = lines
    .map((line) => {
      if (!MODEL.test(line)) return line
      modelsToImport.push(getFirstMatch(line, MATCH))
      return line.replace('models.', '')
    })
    .map((line) => {
      if (!DEBUG.test(line)) return line
      return `${line} // eslint-disable-line @typescript-eslint/no-var-requires`
    })
    .map((line) => {
      if (!TRANS.test(line)) return line
      hasTransaction = true
      return line.replace('let transaction', 'let transaction: Transaction | null = null')
    })
    .map((line) => {
      if (!TRANS_TYPE.test(line)) return line
      return line.replace('let transaction', 'let transaction: Transaction | null = null')
    })
    .map((line) => {
      if (!EXPORTS.test(line)) return line
      const model = getFirstMatch(line, EXPORTS)
      return `export ${model}`
    })
    .map((line) => {
      if (!ERR.test(line)) return line
      return line.replace('err.name', '(err as { name: string })?.name')
    })
    .map((line) => {
      return line.includes('use strict') ? '' : line
    })
    .map((line) => {
      if (!SERVICE.test(line)) return line
      return line.replace('import', 'import * as')
    })
    .map((line) => {
      if (!FUNC.test(line) || CREATE.test(line) || UPDATE.test(line)) return line
      const sp = line.split('(')

      return `${sp[0]}(${types(sp[1])}`
    })
    .map((line) => {
      if (/^.*create\($/.test(line)) created = true

      return line
    })
    .map((line, index) => {
      if (!CREATE.test(line) || line.includes('debug') || line.includes('values') || created) return line
      const args = getFirstMatch(line, CREATE)

      createIndex = index
      create = args
      created = true

      return line.replace(args, `${args}: CreateType`)
    })
    .map((line, index) => {
      if (!UPDATE.test(line) || line.includes('debug') || line.includes('await')|| updated) return line
      const args = getFirstMatch(line, UPDATE)

      updateIndex = index
      update = args
      updated = true

      return line.replace(`{${args}}`, `{ ${args} }: UpdateType`)
    })

  const createType = create ? `type CreateType = ${create.includes('{') ? types(create) : `{${types(create)}`}\n` : ''
  const withCreateType =  createIndex ? [...rp.slice(0, createIndex-2), createType, ...rp.slice(createIndex-2)] : rp

  const updateType = update ? `type UpdateType = {${types(update)}${ update.includes('}') ? '' :'}' } \n` : ''
  const withTypes =  updateIndex ? [...withCreateType.slice(0, updateIndex - 1), updateType, ...withCreateType.slice(updateIndex - 1)] : withCreateType

  const seqImps = []

  if(Op.test(contents))  seqImps.push('Sequelize')
  if(hasTransaction) seqImps.push('{ Transaction }')

  //const imps = [model, ...modelsToImport].filter((ip, i, s) => s.indexOf(ip) === i)
  const imp = seqImps.length ? `import ${ seqImps.join(', ')} from 'sequelize'` : ''
  return [imp, ...withTypes].join('\n').replace("import from 'sequelize';", '')
}

main()
