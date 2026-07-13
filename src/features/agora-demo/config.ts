/**
 * 声网性能测试 Demo 配置
 * 测试阶段直接写死，生产环境应改为后端签发 Token 或环境变量注入。
 */
export const AGORA_APP_ID = '你的 AppID'

// 无证书项目填 null；有证书项目填临时 Token
export const AGORA_TOKEN: string | null = null
