#!/usr/bin/env node
import { existsSync, readdirSync } from 'fs'
import { resolve } from 'path'
import { execa } from 'execa'
import { promptForOptions, confirmDirectoryOverwrite } from './lib/prompt.js'
import { generateProject } from './lib/generate.js'

const targetDir = process.cwd()
const files = readdirSync(targetDir).filter(f => f !== 'README.md')

async function main() {
  if (files.length > 0) {
    const proceed = await confirmDirectoryOverwrite()
    if (!proceed) {
      console.log('已取消')
      process.exit(0)
    }
  }

  const options = await promptForOptions()
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
