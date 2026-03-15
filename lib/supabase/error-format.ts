const DB_SETUP_GUIDE_MESSAGE =
  '数据库未初始化（缺少 teams/team_members 表）。请在 Supabase SQL Editor 按顺序执行 scripts/001 到 scripts/008 后重试。'

export interface DbErrorLike {
  message: string
  code?: string | null
}

export function formatDbSetupError(error: DbErrorLike): string {
  const isSchemaCacheMissingTable =
    error.code === 'PGRST205' ||
    /schema cache/i.test(error.message) ||
    /Could not find the table 'public\./i.test(error.message)

  if (isSchemaCacheMissingTable) {
    return DB_SETUP_GUIDE_MESSAGE
  }

  return error.message
}
