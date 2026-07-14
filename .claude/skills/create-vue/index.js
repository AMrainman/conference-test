#!/usr/bin/env node
import { generateProject } from './lib/generate.js'

const targetDir = process.cwd()

function parseOptionsArg() {
  const idx = process.argv.indexOf('--options')
  if (idx === -1 || !process.argv[idx + 1]) return null
  try {
    return JSON.parse(process.argv[idx + 1])
  } catch {
    console.error('无法解析 --options 参数')
    process.exit(1)
  }
}

async function main() {
  const options = parseOptionsArg()
  if (!options) {
    console.error('请通过 --options 传入插件组合，例如：')
    console.error(`node index.js --options '{"basePlugins":["vue-router"],"uiLibraries":[],"iconLibraries":[],"dxPlugins":[]}'`)
    process.exit(1)
  }

  console.log('正在生成项目...')
  await generateProject(targetDir, options)

  console.log('项目骨架生成完成')
  console.log('请手动安装依赖：npm install')
  console.log('然后启动开发服务器：npm run dev')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
