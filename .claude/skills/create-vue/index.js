#!/usr/bin/env node
import { readdirSync } from 'fs'
import { execa } from 'execa'
import { generateProject } from './lib/generate.js'

const targetDir = process.cwd()
const files = readdirSync(targetDir).filter(f => f !== 'README.md')

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
    console.error(`node index.js --options '{"basePlugins":["pinia"],"uiLibrary":null,"iconLibraries":[],"dxPlugins":[]}'`)
    process.exit(1)
  }

  console.log('正在生成项目...')
  const manifests = await generateProject(targetDir, options)

  console.log('正在安装依赖...')
  await execa('npm', ['install'], { stdio: 'inherit' })

  for (const manifest of manifests) {
    for (const cmd of manifest.postInstall || []) {
      console.log(`正在执行: ${cmd}`)
      const parts = cmd.split(' ')
      await execa(parts[0], parts.slice(1), { stdio: 'inherit' })
    }
  }

  console.log('正在验证...')
  await execa('npm', ['run', 'type-check'], { stdio: 'inherit' })
  await execa('npm', ['run', 'lint'], { stdio: 'inherit' })
  await execa('npm', ['run', 'test'], { stdio: 'inherit' })
  await execa('npm', ['run', 'build'], { stdio: 'inherit' })

  console.log('项目生成完成')
  console.log('启动开发服务器：npm run dev')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
