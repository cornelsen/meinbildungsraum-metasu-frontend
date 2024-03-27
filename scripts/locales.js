import fs from 'fs'

const getValueByKey = (obj, el) => {
  const nestedKeys = el.split('.')
  let value = obj
  nestedKeys.forEach((k) => {
    value = value[k]
  })

  return value
}

const structureIsEqual = (obj1, obj2) => {
  const tree1 = getKeys(obj1).sort()
  const tree2 = getKeys(obj2).sort()

  let mismatches = []
  tree1.forEach(el => {
    if(tree2.indexOf(el) === -1)
      mismatches.push(el)
  })
  return mismatches
}

const getKeys = (obj) => {
  return recursiveKeys(obj, [], [])
}

const recursiveKeys = (obj, result, todo, root = '') => {
  Object.keys(obj).forEach(key => {
    if(typeof obj[key] === 'object') {
      todo.push({ obj: obj[key], root: root + key + '.' })
    } else {
      result.push(root + key)
    }
  })

  if(todo.length > 0) {
    let todoItem = todo.pop()
    return recursiveKeys(todoItem.obj, result, todo, todoItem.root)
  } else {
    return result
  }
}

/*
-------------------
*/
const path = 'src/locales'

const en = JSON.parse(fs.readFileSync(`${path}/en.json`, 'utf8'))
const de = JSON.parse(fs.readFileSync(`${path}/de.json`, 'utf8'))

const outputDE = structureIsEqual(en, de)
const outputEN = structureIsEqual(de, en)

const html = `
  <html>
    <head>
      <style>
      th {
         background-color: grey;
         color: white;
         text-align: left;
         padding: 5px 10px 5px 10px;
      }
      td {
        padding: 5px 10px 5px 10px;
      }
      tr:nth-child(even) {
        background-color: #e9eff5;
      }
      tr:nth-child(odd) {
        background-color:  white;
      }
      </style>
    </head>
    <body>
      <h2>Missing translations DE (${outputDE.length})</h2>
      <table>
        <tr>
          <th>key</th>
          <th>EN text</th>
        </tr>
        ${outputDE.map(el => `<tr><td>${el}</td><td>${getValueByKey(en, el)}</td></tr>`).join('')}
      </table>

      <h2>Missing translations EN (${outputEN.length})</h2>
      <table>
        <tr>
          <th>key</th>
          <th>DE text</th>
        </tr>
        ${outputEN.map(el => `<tr><td>${el}</td><td>${getValueByKey(de, el)}</td></tr>`).join('')}
      </table>
    </body>
  </html>
`
fs.writeFile('public/locales.html', html, (err) => {
  if (err) throw err
  console.log('locales.html created')
})