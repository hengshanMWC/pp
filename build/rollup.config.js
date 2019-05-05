const rollup = require('rollup')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const terser = require('terser')
const validateNpmPackageName = require('validate-npm-package-name')
const camelcase = require('camelcase')
const babel  = require('rollup-plugin-babel')
const resolve  = require('rollup-plugin-node-resolve')
const cjs  = require('rollup-plugin-commonjs')
const replace  = require('rollup-plugin-replace')
const buble  = require("rollup-plugin-buble")
let {version, name}  = require('../package.json')

let moduleName = name

// 检查是否是合法的 npm 包名
if (!validateNpmPackageName(moduleName)) {
  throw new Error(`${moduleName} 不是一个合法的 npm 包名`)
}

// 对于 npm 私有包，取 @scope 后面的部分作为包名
if (/^@.+\//g.test(moduleName)) {
  moduleName = moduleName.split('/')[1]
}

// 将其他形式的命名规则转换为驼峰命名
moduleName = camelcase(moduleName)


// 头信息
const banner = '// * Released under the MIT License.\n'

// rollup 配置
const builds = {
  'pp-cjs': {
    entry: 'package/pp/src/index.js',
    dest: `package/pp/dist/pp.cjs.js`,
    format: 'cjs',
    external: ['lodash/defaults']
  },
  'pp-es': {
    entry: 'package/pp/src/index.js',
    // 当文件名包含 .min 时将会自动启用 terser 进行压缩
    dest: `package/pp/dist/pp.es.js`,
    format: 'es',
    external: ['lodash/defaults']
  },
  'pp-client-cjs': {
    entry: 'package/pp-client/src/index.js',
    dest: `package/pp-client/dist/pp-client.cjs.js`,
    format: 'cjs',
    external: ['lodash/defaults']
  },
  'pp-client-es': {
    entry: 'package/pp-client/src/index.js',
    // 当文件名包含 .min 时将会自动启用 terser 进行压缩
    dest: `package/pp-client/dist/pp-client.es.js`,
    format: 'es',
    external: ['lodash/defaults']
  },
  'pp-client-umd': {
    entry: 'package/pp-client/src/index.js',
    // 当文件名包含 .min 时将会自动启用 terser 进行压缩
    dest: `package/pp-client/dist/pp-client.umd.js`,
    format: 'umd',
    name: moduleName.toUpperCase()
  },
}




const genConfig  = key => {
  const {entry, dest, format, plugins = [], external = [], resolveOptions = {}, name} = builds[key]
  const config = {
    input: entry,
    output: {
      file: dest,
      format,
      banner,
      name: name || moduleName
    },
    plugins: [
      // babel
      babel({
        babelrc: false,
        exclude: 'node_modules/**',
        runtimeHelpers: true,
      }),
      // 让 commonJs 模块转换为 es6 模块
      cjs(),
      // 内容替换
      replace({
        __VERSION__: version
      }),
      buble(),
      resolve(resolveOptions),
    ].concat(plugins),

    external: [].concat(external),
    // 监听
    watch: {
      include: 'src/**',
    }
  }

  return config
}


// 以下代码取自 vue 官方仓库
// 通过 rollup api 打包所有 builds 中的配置
const getAllBuilds = Object.keys(builds).map(genConfig )

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}


build(getAllBuilds)

function build (builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }

  next()
}


function buildEntry (config) {
  const output = config.output
  const { file, banner } = output
  const isProd = /(min|prod)\.js$/.test(file)
  return rollup.rollup(config)
    .then(bundle => bundle.generate(output))
    .then((code) => {
      if (isProd) {
        const minified = (banner ? banner + '\n' : '') + terser.minify(code.code, {
          toplevel: true,
          output: {
            ascii_only: true
          },
          compress: {
            pure_funcs: ['makeMap']
          }
        }).code
        return write(file, minified, true)
      } else {
        return write(file, code.code)
      }
    })
}



function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
