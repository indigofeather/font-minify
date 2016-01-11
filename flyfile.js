import config from './config'
import Fontmin from 'fontmin'
import fs from 'fs'

function* entries(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]]
  }
}

export function* prepare() {
  for (let [key, value] of entries(config)) {
    yield this.source(value.source)
      .filter((data) => `${data}`.replace(/\s/g, ''))
      .concat(`${key}-text`)
      .target('tmp')
  }
}

export function* font() {
  for (let [key, value] of entries(config)) {
    let text = fs.readFileSync(`./tmp/${key}-text`, { encoding: 'utf-8' })
    new Fontmin()
      .src(value.fontSrc)
      .dest(value.target)
      .use(Fontmin.glyph({
        text: text
      }))
      .use(Fontmin.ttf2eot())
      .use(Fontmin.ttf2woff())
      .use(Fontmin.ttf2svg())
      .use(Fontmin.css({
        fontPath: '../font/'
      }))
      .run((err, files) => {
        if (err) {
          console.log(err)
          return
        }

        files.forEach(function (optimizedFile, index) {
          console.log(optimizedFile, index)
        })
      })
  }
}

export default function* () {
  yield this.clear('tmp')
  yield this.start(['prepare', 'font'])
}
