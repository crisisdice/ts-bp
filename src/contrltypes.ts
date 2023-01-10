import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { getMatch } from './utils'

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
  callbacks: ((file: string, filename: string) => string)[]
) {
  const files = readdirSync(root)
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
  applyToFiles('/Users/alexanderdaily/work/core/api/src/controllers', [replace])
}

const replace = (contents: string, filename: string) => {
  const routes = readDir('/Users/alexanderdaily/work/core/api/src/routes/')

  const IMPORT = new RegExp(
    `import { ([a-zA-Z2]*) } from '\.\.\/controllers\/${filename.split('.')[0]}'`
  )
  const found = routes.find(({ file }) => IMPORT.test(file))

  if (!found) {
    return contents
  }

  const { file: route, path } = found

  const impt = getMatch(route, IMPORT)

  const MATCH_DEC = new RegExp(`server\\.[a-z]*\\([^;]*${impt}\\s*\\);`, 'm')

  if (!MATCH_DEC.test(route)) {
    console.log('no dec')
    console.log(filename)
    return contents
  }

  const FUNCTION_DEC = /export async function ([a-zA-Z2]*)\(/
  const TYPELINE = /req: FastifyRequest<([^>]*)>,/m

  if (!FUNCTION_DEC.test(contents)) {
    // console.log('no func dec')
    // console.log(filename)
    return contents
  }

  if (!TYPELINE.test(contents)) {
    //console.log('no typeline')
    //console.log(filename)
    return contents
  }


  function toCap(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  const typeName = `${toCap(getMatch(contents, FUNCTION_DEC))}Data`
  const oldType = getMatch(contents, TYPELINE).replace('>,', '')

  const type = `export type ${typeName} = ${oldType}`

  contents = contents.replace(oldType, typeName)

  let split: number

  const lines = contents.split('\n')
  lines.forEach((v,i) => {
    if (FUNCTION_DEC.test(v)) {
      split = (i - 2)
    }

    if (TYPELINE.test(v)) {
      lines[i] = `req: FastifyRequest<${typeName}>,`
    }
  })

  //
  
  const routeDec = getMatch(route, MATCH_DEC, 0)
  const updatedRouteDec = [routeDec.split('\n')[0].replace('(', `<${typeName}>(`), ...routeDec.split('\n').slice(1)].join('\n')

  const updatedRoute = route
    .split('\n')
    .map((line) => {
      if (!IMPORT.test(line)) return line
      return `import { ${impt}, ${typeName} } from '\.\.\/controllers\/${filename.split('.')[0]}'`
    }).join('\n').replace(routeDec, updatedRouteDec)

  writeFileSync(path, updatedRoute)

  //

  return [ ...lines.slice(0, split), '', type, '', ...lines.slice(split) ].join('\n')
}


main()
