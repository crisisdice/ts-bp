import { readdirSync, readFileSync, writeFileSync } from 'fs'

const id = () => 'number' 
const int = () => 'number' 
const integer = () => 'number' 
const year = () => 'number' 
const month = () => 'number' 

const ids = () => 'number[]' 

const str = () => 'string' 
const hash = () => 'string' 
const appUid = () => 'string' 
const iso = () => 'string' 
const iso8601 = () => 'string' 
const logintoken = () => 'string' 
const fileExt = () => 'string' 
const twofaCode = () => 'string' 
const semver = () => 'string' 
const bucketName = () => 'string' 
const awsRoleArn = () => 'string' 
const locale = () => 'string' 

const bool = () => 'boolean' 
const boolean = () => 'boolean' 

// TODO
const userRights = () => 'any' 
const recieptType = () => 'any' 
const analyticsexportTypeId = () => 'any' 
const analyticsexportData = () => 'any' 
const appConfig = () => 'any' 
const assetsPutData = () => 'any' 
const contentType = () => 'any' 
const conversionItemType = () => 'any' 
const deploymentContent = () => 'any' 
const feedType = () => 'any' 
const playerType = () => 'any' 
const receiptType = () => 'any' 
const releaseCategoryList = () => 'any' 
const resourceType = () => 'any' 
const tagsData = () => 'any' 
const releaseCategories = () => 'any' 
const APP_SETUP_VERSIONS = () => 'any' 
const obj = () => 'any' 

const getMatch = (line: string, regex: RegExp, i = 1) => Array.from(line.match(regex))[i]

function readDir(root: string, EXCLUDES = []) {
  return readdirSync(root)
    .filter((file) => !EXCLUDES.includes(file))
    .map((file) => {
      try {
        return { file: readFileSync(`${root}/${file}`, 'utf8'), path: `${root}/${file}` }
      } catch (e) {
        console.log(`Error with ${file}`)
        console.log(e)
      }
    })
}


function applyToFiles(
  root: string,
  callbacks: ((file: string, filename: string) => string)[],
  isMiddleware = false
) {
  const files = readdirSync(root)
//     ['check-login.ts', 'check-access-app.ts', 'check-lambda-secret.ts', 'rewrite-feed-filename.ts']
//     : [
// 'app-delete-icon.ts',
// 'app-get-appreceiptvalidatorsetup.ts',
// 'app-get-feed.ts',
// 'app-get-ids.ts',
// 'app-get-logininfo.ts',
// 'app-get.ts',
// 'app-list-get.ts',
// 'app-post.ts',
// 'app-put-config.ts',
// 'app-put-icon.ts',
// 'app-put.ts',
// 'appuser-delete.ts',
    //]
  //readdirSync(root)
  for (const file of files) {
    try {
      const path = `${root}/${file}`
      let contents = readFileSync(path, 'utf8')
      for (const callback of callbacks) {
        contents = callback(contents, file)
      }
      writeFileSync(path, contents)
    } catch (e) {
      console.log(`Error with ${file}`)
      console.log(e)
    }
  }
}

export function main() {
  const changeControllers = setup(false)
  const changeMiddleware = setup(true)

  applyToFiles('/Users/alexanderdaily/work/core/api/src/middleware', [changeMiddleware], true)
  applyToFiles('/Users/alexanderdaily/work/core/api/src/controllers', [changeControllers])
}

const setup = (isMiddleware: boolean) => {
  return (contents: string, filename: string) => {
    const routes = readDir('/Users/alexanderdaily/work/core/api/src/routes/')

    const IMPORT = new RegExp(
      isMiddleware
      ? `import ([a-zA-Z]*) from '\.\.\/middleware\/${filename.split('.')[0]}'`
      : `import { ([a-zA-Z2]*) } from '\.\.\/controllers\/${filename.split('.')[0]}'`
    )
    const found = routes.find(({ file }) => IMPORT.test(file))

    if (!found) {
      return contents
    }

    const { file: route, path } = found

    const impt = getMatch(route, IMPORT)

    const MATCH_DEC = new RegExp(
      isMiddleware
      ? `server\\.[a-z]*\\([^;]*      preHandler: \\[${impt}`
      : `server\\.[a-z]*\\([^;]*${impt}\\s*\\);`
      , 'm')

    if (!MATCH_DEC.test(route)) {
      console.log('no dec')
      console.log(filename)
      return contents
    }

    const dec = getMatch(route, MATCH_DEC, 0)
    const SCHEMA = /      schema: {[\s\S]*      }/m

    if (!SCHEMA.test(dec)) {
      console.log('no schema')
      console.log(filename)
      return contents
    }
    const lines = contents.split('\n')
    const VALIDATED = /const { (.*) } = req.validatedParams;/

    const line = lines.find(l => VALIDATED.test(l))

    // if (!line) {
    //   console.log('no validatedParams')
    //   console.log(filename)
    //   return contents
    // }

    const matches = line ? getMatch(line, VALIDATED).split(', '): []

    console.log(matches)
    
    const toPair = (arg: {}) => Object.entries(arg).filter(([key,]) =>
      isMiddleware ? matches.includes(key) : true
    ).map(([key, value]) => `${key}: ${value}`)

    const schemaObj = getMatch(dec, SCHEMA, 0).split('preHandler')[0]

    console.log(schemaObj)

    const { schema } = eval(`() => { return { ${ schemaObj } } }`)()

    const all = [...toPair(schema?.params ?? {}), ...toPair(schema?.body ?? {}), ...toPair(schema?.querystring ?? {})].join(', ')

    const params = schema?.params ? `Params: { ${toPair(schema.params).join(', ')} }` : null
    const body = schema?.body ? `Body: { ${toPair(schema.body).join(', ')} }` : null
    const qs = schema?.querystring ? `Querystring: { ${toPair(schema.querystring).join(', ')} }` : null
    const typeline = isMiddleware
      ? `<{ Params: {${all}} } | { Body: {${all}} } | { Querystring: {${all}} }>`
      : `<{ ${[params, body, qs].filter(s => !!s).join(', ')} }>`
    //? `<Record<string, { ${all} }>>`
    //:

    if (!isMiddleware) {
      const decLines = dec.split('\n')
      const fixedDec = [ `${decLines[0].replace('(', `${typeline}(`)}`, ...decLines.slice(1)].join('\n')
      writeFileSync(path, route.replace(dec, fixedDec))
    }

    console.log(typeline)

    const FASTIFY = /req: FastifyRequest/
    //return contents
    return lines.map((line) => {
      if (!FASTIFY.test(line)) return line

      return line.replace('FastifyRequest', `FastifyRequest${typeline}`)
    }).join('\n')
  }
}

main()
