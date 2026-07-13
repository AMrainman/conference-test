/**
 * 声网性能测试 Demo 配置
 * 测试阶段直接写死，生产环境应改为后端签发 Token 或环境变量注入。
 */
export const AGORA_APP_ID = '6510430cd3c8484e8e7b1fb32df77500'

// 无证书项目填 null；有证书项目填临时 Token
export const AGORA_TOKEN: string | null =
  '0066112165ff8d94702a84b161af4c72690IAAVHDMlS3WmkJT9MJ1hwjQFRx+eTdaBs6SkTnkag2qszm3cbl8AAAAAIgAFPcKHcu1VagQAAQCSKFVqAgCSKFVqAwCSKFVqBACSKFVq'
