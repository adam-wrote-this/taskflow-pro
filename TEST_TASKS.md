# 测试执行任务清单

## 目标
将 TEST_PLAN.md 拆解为可执行任务，按优先级推进并可在迭代中持续打勾。

## Sprint 1（基础与 P0）

- [x] 配置完成并验证可运行：`pnpm test`、`pnpm test:e2e`
- [x] 补齐 P0 单元测试（任务状态归一、截止时间计算、错误分支）
- [x] 补齐类型配置单元测试（TASK_STATUS_CONFIG / TASK_PRIORITY_CONFIG / TEAM_ROLE_CONFIG）
- [x] 补齐 P0 E2E：
  - [x] 未登录访问受保护路由会重定向到登录页（`permissions-and-signout.spec.ts`）
  - [x] 登录页/注册页互跳与关键字段校验
  - [x] 注册成功/失败（`sign-up-flow.spec.ts`，部分凭证门控）
  - [x] 登录成功/失败（凭证门控）
  - [x] 创建团队（凭证 + 写入门控）
  - [x] 创建项目（`task-workflow.spec.ts`，凭证 + 写入门控）
  - [x] 创建任务（凭证 + 写入门控）
  - [x] 拖拽任务跨列（凭证 + 写入门控）
  - [x] 任务编辑保存（凭证 + 写入门控）
  - [x] 任务删除（凭证 + 写入门控）
  - [x] 权限拦截（非成员访问受保护路由）
  - [x] 退出登录（`permissions-and-signout.spec.ts`，凭证门控）
- [x] 组件测试：新建任务弹窗（`tests/component/create-task-dialog.test.tsx`）
- [x] 组件测试：邀请成员弹窗（`tests/component/invite-member-dialog.test.tsx`）
- [ ] 建立缺陷模板（标题、复现步骤、期望、实际、日志）

## Sprint 2（P1 与回归）

- [x] 成员管理流程 E2E（邀请、改角色、移除）– `team-members.spec.ts`
- [x] 设置页流程 E2E（改名、改密码）– `settings-and-i18n.spec.ts`
- [x] i18n 回归（zh/en 文案与日期格式）– `settings-and-i18n.spec.ts`
- [ ] 错误路径回归（Supabase 错误提示）
- [ ] 跨浏览器回归（至少 Chromium + Edge）

## 数据库专项

- [ ] scripts/001-010 在测试库执行完成
- [x] SQL smoke 脚本已建立（`scripts/smoke_test.sql`）
- [ ] 在测试库执行 smoke_test.sql 并确认全部通过
- [ ] 验证 team_members RLS：
  - [ ] owner/admin 可管理成员
  - [ ] member 不可提升他人角色
  - [ ] 非成员不可读取团队成员
- [ ] 验证 task_status：
  - [x] backlog/review 枚举存在（smoke_test.sql 覆盖）
  - [x] in_review 历史数据已归一（smoke_test.sql 覆盖）

## CI 门禁

- [ ] PR 必跑 lint + typecheck + unit
- [ ] main 分支必跑 e2e smoke
- [ ] 失败自动上传 Playwright 报告

## 完成定义（DoD）

- [ ] P0 全通过
- [ ] P1 通过率 >= 95%
- [ ] 无未处理 Sev-1/Sev-2
- [ ] 发布前回归报告已归档
