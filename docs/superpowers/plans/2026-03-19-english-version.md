# English Version Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add English/Chinese bilingual support to the DSA web UI using react-i18next, with Chinese as the default fallback and language preference persisted to localStorage.

**Architecture:** Install react-i18next with LanguageDetector. Create per-namespace JSON translation files under `src/i18n/locales/{en,zh}/`. Wire the i18n instance into `main.tsx` before the app renders. Then replace hardcoded Chinese strings page-by-page and component-by-component, using `useTranslation` hooks. The `systemConfigI18n.ts` utility is kept as-is (it serves only the Settings config fields and is not user-facing UI). Add a language toggle to `ShellHeader` so users can switch languages.

**Tech Stack:** react-i18next 15.x, i18next, i18next-browser-languagedetector, TypeScript (resolveJsonModule), React 19, Vite 7

---

## File Map

### New files
| Path | Purpose |
|------|---------|
| `src/i18n/index.ts` | i18n instance: init, plugins, namespace resources |
| `src/i18n/locales/zh/common.json` | Shared strings: nav, dialogs, buttons, aria-labels |
| `src/i18n/locales/en/common.json` | Same keys, English values |
| `src/i18n/locales/zh/home.json` | HomePage strings |
| `src/i18n/locales/en/home.json` | Same keys, English values |
| `src/i18n/locales/zh/settings.json` | SettingsPage strings |
| `src/i18n/locales/en/settings.json` | Same keys, English values |
| `src/i18n/locales/zh/backtest.json` | BacktestPage strings |
| `src/i18n/locales/en/backtest.json` | Same keys, English values |
| `src/i18n/locales/zh/login.json` | LoginPage strings |
| `src/i18n/locales/en/login.json` | Same keys, English values |
| `src/i18n/locales/zh/chat.json` | ChatPage strings |
| `src/i18n/locales/en/chat.json` | Same keys, English values |
| `src/i18n/locales/zh/portfolio.json` | PortfolioPage strings |
| `src/i18n/locales/en/portfolio.json` | Same keys, English values |

### Modified files
| Path | Change |
|------|--------|
| `tsconfig.app.json` | Add `"resolveJsonModule": true` |
| `src/main.tsx` | Import `src/i18n/index.ts` before app render |
| `src/App.tsx` | Replace hardcoded `重试` with `t('common:retry')` |
| `src/components/layout/ShellHeader.tsx` | Add language toggle button; translate TITLES record |
| `src/components/layout/SidebarNav.tsx` | Translate nav labels and logout dialog |
| `src/components/layout/Shell.tsx` | Translate aria-labels |
| `src/components/common/ConfirmDialog.tsx` | Translate default props |
| `src/components/common/Button.tsx` | Translate default `loadingText` |
| `src/components/common/Loading.tsx` | Translate default `label` |
| `src/components/common/Select.tsx` | Translate default `placeholder` |
| `src/components/common/Input.tsx` | Translate password toggle aria-labels |
| `src/components/common/JsonViewer.tsx` | Translate empty state and copy button |
| `src/components/common/Drawer.tsx` | Translate close aria-label |
| `src/components/common/ApiErrorAlert.tsx` | Translate default dismiss label |
| `src/components/history/HistoryList.tsx` | Translate all labels |
| `src/components/tasks/TaskPanel.tsx` | Translate status badges |
| `src/components/report/ReportNews.tsx` | Translate section labels |
| `src/components/report/ReportMarkdown.tsx` | Translate drawer labels |
| `src/components/report/ReportDetails.tsx` | Translate section headings |
| `src/components/report/ReportOverview.tsx` | Translate fallback labels |
| `src/components/report/ReportSummary.tsx` | Translate model attribution |
| `src/components/report/ReportStrategy.tsx` | Translate strategy labels |
| `src/components/settings/AuthSettingsCard.tsx` | Translate all strings |
| `src/components/settings/ChangePasswordCard.tsx` | Translate all strings |
| `src/components/settings/SettingsCategoryNav.tsx` | Translate section labels |
| `src/components/settings/SettingsField.tsx` | Translate field UI strings |
| `src/components/settings/LLMChannelEditor.tsx` | Translate provider labels and UI |
| `src/components/settings/IntelligentImport.tsx` | Translate confidence levels and UI |
| `src/pages/HomePage.tsx` | Translate all strings |
| `src/pages/SettingsPage.tsx` | Translate all strings |
| `src/pages/BacktestPage.tsx` | Translate `document.title` |
| `src/pages/LoginPage.tsx` | Translate all strings |
| `src/pages/ChatPage.tsx` | Translate all strings |
| `src/pages/PortfolioPage.tsx` | Translate all strings |
| `src/pages/NotFoundPage.tsx` | Translate all strings |
| `src/utils/validation.ts` | Remove hardcoded Chinese; accept translated message or use i18n |
| `src/utils/format.ts` | Translate report type labels |
| `src/utils/chatExport.ts` | Translate export headings and filename |

---

## Task 1: Install dependencies and enable JSON imports

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.app.json`

- [ ] **Step 1: Install i18n packages**

```bash
cd apps/dsa-web
npm install react-i18next i18next i18next-browser-languagedetector
```

Expected: packages added to `dependencies` in `package.json`.

- [ ] **Step 2: Enable `resolveJsonModule` in TypeScript config**

In `tsconfig.app.json`, add to `compilerOptions`:
```json
"resolveJsonModule": true
```

- [ ] **Step 3: Verify TypeScript still compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json tsconfig.app.json
git commit -m "chore(i18n): install react-i18next and enable resolveJsonModule"
```

---

## Task 2: Create i18n instance and `common` namespace translations

**Files:**
- Create: `src/i18n/index.ts`
- Create: `src/i18n/locales/zh/common.json`
- Create: `src/i18n/locales/en/common.json`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create `src/i18n/locales/zh/common.json`**

```json
{
  "retry": "重试",
  "cancel": "取消",
  "confirm": "确认",
  "delete": "删除",
  "deleting": "删除中...",
  "save": "保存",
  "close": "关闭",
  "loading": "加载中...",
  "appName": "DSA",
  "nav": {
    "home": "首页",
    "chat": "问股",
    "portfolio": "持仓",
    "backtest": "回测",
    "settings": "设置",
    "openMenu": "打开导航菜单",
    "desktopNav": "桌面侧边导航",
    "navMenu": "导航菜单",
    "mainNav": "主导航",
    "expandSidebar": "展开侧边栏",
    "collapseSidebar": "折叠侧边栏"
  },
  "logout": {
    "button": "退出",
    "title": "退出登录",
    "message": "确认退出当前登录状态吗？退出后需要重新输入密码。",
    "confirm": "确认退出"
  },
  "confirmDialog": {
    "confirm": "确定",
    "cancel": "取消"
  },
  "button": {
    "processing": "处理中..."
  },
  "loadingLabel": "正在加载",
  "selectPlaceholder": "请选择",
  "passwordToggle": {
    "hide": "隐藏内容",
    "show": "显示内容",
    "hideTitle": "隐藏",
    "showTitle": "显示"
  },
  "jsonViewer": {
    "empty": "暂无数据",
    "copy": "复制",
    "copied": "已复制!"
  },
  "drawer": {
    "closeAriaLabel": "关闭抽屉"
  },
  "apiError": {
    "dismiss": "关闭",
    "viewDetails": "查看详情"
  },
  "shellHeader": {
    "routes": {
      "/": { "title": "首页", "description": "股票分析与历史报告工作台" },
      "/chat": { "title": "问股", "description": "多轮策略问答与历史会话管理" },
      "/backtest": { "title": "回测", "description": "回测任务与结果浏览" },
      "/settings": { "title": "设置", "description": "系统配置、模型与认证管理" },
      "/portfolio": { "title": "持仓", "description": "组合快照与风险分析" }
    }
  },
  "language": {
    "toggle": "English",
    "zh": "中文",
    "en": "English"
  },
  "notFound": {
    "title": "页面未找到 - DSA",
    "heading": "页面未找到",
    "message": "抱歉，您访问的页面不存在或已被移动",
    "backHome": "返回首页"
  }
}
```

- [ ] **Step 2: Create `src/i18n/locales/en/common.json`**

```json
{
  "retry": "Retry",
  "cancel": "Cancel",
  "confirm": "Confirm",
  "delete": "Delete",
  "deleting": "Deleting...",
  "save": "Save",
  "close": "Close",
  "loading": "Loading...",
  "appName": "DSA",
  "nav": {
    "home": "Home",
    "chat": "Chat",
    "portfolio": "Portfolio",
    "backtest": "Backtest",
    "settings": "Settings",
    "openMenu": "Open navigation menu",
    "desktopNav": "Desktop side navigation",
    "navMenu": "Navigation menu",
    "mainNav": "Main navigation",
    "expandSidebar": "Expand sidebar",
    "collapseSidebar": "Collapse sidebar"
  },
  "logout": {
    "button": "Logout",
    "title": "Logout",
    "message": "Are you sure you want to logout? You will need to re-enter your password.",
    "confirm": "Confirm Logout"
  },
  "confirmDialog": {
    "confirm": "OK",
    "cancel": "Cancel"
  },
  "button": {
    "processing": "Processing..."
  },
  "loadingLabel": "Loading",
  "selectPlaceholder": "Select...",
  "passwordToggle": {
    "hide": "Hide content",
    "show": "Show content",
    "hideTitle": "Hide",
    "showTitle": "Show"
  },
  "jsonViewer": {
    "empty": "No data",
    "copy": "Copy",
    "copied": "Copied!"
  },
  "drawer": {
    "closeAriaLabel": "Close drawer"
  },
  "apiError": {
    "dismiss": "Close",
    "viewDetails": "View details"
  },
  "shellHeader": {
    "routes": {
      "/": { "title": "Home", "description": "Stock analysis and report workspace" },
      "/chat": { "title": "Chat", "description": "Multi-turn strategy Q&A and session management" },
      "/backtest": { "title": "Backtest", "description": "Backtest tasks and results" },
      "/settings": { "title": "Settings", "description": "System config, models, and auth management" },
      "/portfolio": { "title": "Portfolio", "description": "Portfolio snapshots and risk analysis" }
    }
  },
  "language": {
    "toggle": "中文",
    "zh": "中文",
    "en": "English"
  },
  "notFound": {
    "title": "Page Not Found - DSA",
    "heading": "Page Not Found",
    "message": "Sorry, the page you are looking for does not exist or has been moved.",
    "backHome": "Back to Home"
  }
}
```

- [ ] **Step 3: Create `src/i18n/index.ts`**

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import zhCommon from './locales/zh/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      zh: { common: zhCommon },
    },
    fallbackLng: 'zh',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

> **Note:** Each subsequent task will add its namespace import here. This avoids building a large broken file all at once.

- [ ] **Step 4: Import i18n in `src/main.tsx`**

Add as the first import (before React):
```ts
import './i18n';
```
> **Note:** Do not use `.ts` extension — the project uses `"noUncheckedSideEffectImports": true` which treats `.ts` side-effect imports strictly. Vite and TypeScript bundler mode will resolve `./i18n` to `./i18n/index.ts` automatically.

- [ ] **Step 5: Build to verify no errors**

```bash
npm run build
```

Expected: build succeeds with no TypeScript or module errors.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ src/main.tsx tsconfig.app.json
git commit -m "feat(i18n): bootstrap react-i18next with common namespace"
```

---

## Task 3: Translate shared layout components (Shell, SidebarNav, ShellHeader)

**Files:**
- Modify: `src/components/layout/Shell.tsx`
- Modify: `src/components/layout/SidebarNav.tsx`
- Modify: `src/components/layout/ShellHeader.tsx`

- [ ] **Step 1: Translate `Shell.tsx`**

Add `useTranslation('common')` and replace:
- `"打开导航菜单"` → `t('nav.openMenu')`
- `"桌面侧边导航"` → `t('nav.desktopNav')`
- `"导航菜单"` → `t('nav.navMenu')`

- [ ] **Step 2: Translate `SidebarNav.tsx` nav labels**

Change the `NAV_ITEMS` array so labels use `t()`:
```ts
const { t } = useTranslation('common');
const NAV_ITEMS = [
  { key: 'home',      label: t('nav.home'),      ... },
  { key: 'chat',      label: t('nav.chat'),      ... },
  { key: 'portfolio', label: t('nav.portfolio'), ... },
  { key: 'backtest',  label: t('nav.backtest'),  ... },
  { key: 'settings',  label: t('nav.settings'),  ... },
];
```

Also translate:
- `aria-label="主导航"` → `aria-label={t('nav.mainNav')}`
- `aria-label="问股有新消息"` → translate the badge
- Logout button `退出` → `t('logout.button')`
- ConfirmDialog props → `t('logout.title')`, `t('logout.message')`, etc.

- [ ] **Step 3: Translate `ShellHeader.tsx` TITLES record and language toggle**

Replace the static `TITLES` object with a function that reads from `t()`:
```ts
const { t, i18n } = useTranslation('common');
const routes: Record<string, { title: string; description: string }> = {
  '/':          { title: t('shellHeader.routes./.title'), description: t('shellHeader.routes./.description') },
  '/chat':      { title: t('shellHeader.routes./chat.title'), description: t('shellHeader.routes./chat.description') },
  '/backtest':  { title: t('shellHeader.routes./backtest.title'), description: t('shellHeader.routes./backtest.description') },
  '/settings':  { title: t('shellHeader.routes./settings.title'), description: t('shellHeader.routes./settings.description') },
  '/portfolio': { title: t('shellHeader.routes./portfolio.title'), description: t('shellHeader.routes./portfolio.description') },
};
```

Add a language toggle button next to existing controls:
```tsx
<button
  type="button"
  onClick={() => i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')}
  className="text-xs text-secondary-text hover:text-foreground transition-colors"
>
  {t('language.toggle')}
</button>
```

Also translate:
- `aria-label={t('nav.expandSidebar')}` / `t('nav.collapseSidebar')`
- `title="导航菜单"` on `<Drawer>` (this is a rendered heading, not just aria) → `title={t('nav.navMenu')}`

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/
git commit -m "feat(i18n): translate Shell, SidebarNav, ShellHeader layout components"
```

---

## Task 4: Translate shared common UI primitives

**Files:**
- Modify: `src/components/common/ConfirmDialog.tsx`
- Modify: `src/components/common/Button.tsx`
- Modify: `src/components/common/Loading.tsx`
- Modify: `src/components/common/Select.tsx`
- Modify: `src/components/common/Input.tsx`
- Modify: `src/components/common/JsonViewer.tsx`
- Modify: `src/components/common/Drawer.tsx`
- Modify: `src/components/common/ApiErrorAlert.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: `ConfirmDialog.tsx` - translate default props**

Inside the component body (not in destructuring defaults):
```ts
const { t } = useTranslation('common');
const resolvedConfirmText = confirmText ?? t('confirmDialog.confirm');
const resolvedCancelText = cancelText ?? t('confirmDialog.cancel');
// Use resolvedConfirmText / resolvedCancelText in JSX
```

- [ ] **Step 2: `Button.tsx` - translate default `loadingText`**

Inside the component body:
```ts
const { t } = useTranslation('common');
const resolvedLoadingText = loadingText ?? t('button.processing');
// Use resolvedLoadingText in JSX
```

- [ ] **Step 3: `Loading.tsx` - translate default `label`**

Inside the component body:
```ts
const { t } = useTranslation('common');
const resolvedLabel = label ?? t('loadingLabel');
```

- [ ] **Step 4: `Select.tsx` - translate default `placeholder`**

Inside the component body:
```ts
const { t } = useTranslation('common');
const resolvedPlaceholder = placeholder ?? t('selectPlaceholder');
```

- [ ] **Step 5: `Input.tsx` - translate password toggle aria-labels**

```ts
aria-label={showPassword ? t('passwordToggle.hide') : t('passwordToggle.show')}
title={showPassword ? t('passwordToggle.hideTitle') : t('passwordToggle.showTitle')}
```

- [ ] **Step 6: `JsonViewer.tsx` - translate copy and empty state**

```ts
{isEmpty && <span>{t('jsonViewer.empty')}</span>}
// copy button:
{copied ? t('jsonViewer.copied') : t('jsonViewer.copy')}
```

- [ ] **Step 7: `Drawer.tsx` - translate close aria-label**

```ts
aria-label={t('drawer.closeAriaLabel')}
```

- [ ] **Step 8: `ApiErrorAlert.tsx` - translate dismiss and details labels**

```ts
const { t } = useTranslation('common');
const resolvedDismissLabel = dismissLabel ?? t('apiError.dismiss');
// "查看详情" summary:
<summary>{t('apiError.viewDetails')}</summary>
```

- [ ] **Step 9: `App.tsx` - translate retry button**

```ts
const { t } = useTranslation('common');
// Replace 重试:
<button>{t('retry')}</button>
```

- [ ] **Step 10: Build and verify**

```bash
npm run build
```

- [ ] **Step 11: Commit**

```bash
git add src/components/common/ src/App.tsx
git commit -m "feat(i18n): translate common UI primitives and App.tsx"
```

---

## Task 5: `home` namespace + translate HomePage

**Files:**
- Create: `src/i18n/locales/zh/home.json`
- Create: `src/i18n/locales/en/home.json`
- Modify: `src/i18n/index.ts`
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/utils/validation.ts`

- [ ] **Step 1: Create `src/i18n/locales/zh/home.json`**

```json
{
  "title": "每日选股分析 - DSA",
  "placeholder": "输入股票代码，如 600519、00700、AAPL",
  "analyze": "分析",
  "analyzing": "分析中",
  "historyTitle": "历史记录",
  "loadingReport": "加载报告中...",
  "emptyState": {
    "heading": "开始分析",
    "description": "输入股票代码进行分析，或从左侧选择历史报告查看"
  },
  "actions": {
    "askAI": "追问 AI",
    "detailedReport": "详细报告"
  },
  "deleteConfirm": {
    "title": "删除历史记录",
    "messageSingle": "确认删除这条历史记录吗？删除后将不可恢复。",
    "messagePlural": "确认删除选中的 {{count}} 条历史记录吗？删除后将不可恢复。",
    "confirm": "确认删除",
    "confirming": "删除中..."
  },
  "errors": {
    "analysisFailed": "分析失败",
    "duplicateTask": "股票 {{stockCode}} 正在分析中，请等待完成"
  }
}
```

- [ ] **Step 2: Create `src/i18n/locales/en/home.json`**

```json
{
  "title": "Daily Stock Analysis - DSA",
  "placeholder": "Enter stock code, e.g. 600519, 00700, AAPL",
  "analyze": "Analyze",
  "analyzing": "Analyzing",
  "historyTitle": "History",
  "loadingReport": "Loading report...",
  "emptyState": {
    "heading": "Start Analysis",
    "description": "Enter a stock code to analyze, or select a report from the history on the left"
  },
  "actions": {
    "askAI": "Ask AI",
    "detailedReport": "Full Report"
  },
  "deleteConfirm": {
    "title": "Delete History",
    "messageSingle": "Are you sure you want to delete this history record? This cannot be undone.",
    "messagePlural": "Are you sure you want to delete {{count}} history records? This cannot be undone.",
    "confirm": "Confirm Delete",
    "confirming": "Deleting..."
  },
  "errors": {
    "analysisFailed": "Analysis failed",
    "duplicateTask": "Stock {{stockCode}} is already being analyzed, please wait"
  }
}
```

- [ ] **Step 3: Add `home` namespace to `src/i18n/index.ts`**

```ts
import enHome from './locales/en/home.json';
import zhHome from './locales/zh/home.json';
// Add to resources:
en: { common: enCommon, home: enHome },
zh: { common: zhCommon, home: zhHome },
```

- [ ] **Step 4: Translate `src/pages/HomePage.tsx`**

```ts
const { t } = useTranslation(['home', 'common']);
// document.title:
document.title = t('home:title');
// Input placeholder:
placeholder={t('home:placeholder')}
// Analyze button:
{isAnalyzing ? t('home:analyzing') : t('home:analyze')}
// Mobile hamburger title:
title={t('home:historyTitle')}
// Loading report:
<p>{t('home:loadingReport')}</p>
// Empty state:
<h3>{t('home:emptyState.heading')}</h3>
<p>{t('home:emptyState.description')}</p>
// Action buttons:
{t('home:actions.askAI')}
{t('home:actions.detailedReport')}
// Delete confirm dialog:
title={t('home:deleteConfirm.title')}
message={selectedHistoryIds.length === 1
  ? t('home:deleteConfirm.messageSingle')
  : t('home:deleteConfirm.messagePlural', { count: selectedHistoryIds.length })}
confirmText={isDeletingHistory ? t('home:deleteConfirm.confirming') : t('home:deleteConfirm.confirm')}
cancelText={t('common:cancel')}
// Errors:
setStoreError(getParsedApiError(task.error || t('home:errors.analysisFailed')));
setDuplicateError(t('home:errors.duplicateTask', { stockCode: err.stockCode }));
```

- [ ] **Step 5: Translate `src/utils/validation.ts`**

Remove the hardcoded Chinese strings. Return English-neutral error codes OR accept a `t` function as parameter:

```ts
// Option: return error keys instead of strings
export function validateStockCode(code: string): { valid: boolean; messageKey?: string; normalized?: string } {
  if (!code.trim()) return { valid: false, messageKey: 'home:errors.validation.empty' };
  // ... etc
}
```

Then in `HomePage.tsx`, map the key to a translated string:
```ts
const { valid, messageKey, normalized } = validateStockCode(stockCode);
if (!valid) {
  setInputError(messageKey ? t(messageKey) : '');
  return;
}
```

Add the validation keys to `home.json`:
```json
"errors": {
  ...
  "validation": {
    "empty": "Please enter a stock code",
    "invalid": "Invalid stock code format"
  }
}
```
And in `zh/home.json`:
```json
"errors": {
  ...
  "validation": {
    "empty": "请输入股票代码",
    "invalid": "股票代码格式不正确"
  }
}
```

- [ ] **Step 6: Build and verify**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/i18n/ src/pages/HomePage.tsx src/utils/validation.ts
git commit -m "feat(i18n): add home namespace and translate HomePage"
```

---

## Task 6: `login` namespace + translate LoginPage

**Files:**
- Create: `src/i18n/locales/zh/login.json`
- Create: `src/i18n/locales/en/login.json`
- Modify: `src/i18n/index.ts`
- Modify: `src/pages/LoginPage.tsx`

- [ ] **Step 1: Create `src/i18n/locales/zh/login.json`**

```json
{
  "title": "登录 - DSA",
  "firstTimeSetup": "设置初始密码",
  "pageTitle": "管理员登录",
  "description": {
    "firstTime": "首次启用认证，请为系统工作台设置管理员密码。",
    "normal": "访问 DSA 量化决策引擎需要有效的身份凭证。"
  },
  "fields": {
    "passwordFirstTime": "管理员密码",
    "password": "登录密码",
    "passwordPlaceholder": "请设置 6 位以上密码",
    "loginPlaceholder": "请输入密码",
    "confirmPassword": "确认密码",
    "confirmPlaceholder": "再次确认管理员密码"
  },
  "buttons": {
    "settingUp": "初始化中...",
    "connecting": "正在建立连接...",
    "setupAndLogin": "完成设置并登录",
    "login": "授权进入工作台"
  },
  "errors": {
    "setupFailed": "配置失败",
    "authFailed": "验证未通过",
    "passwordMismatch": "两次输入的密码不一致"
  },
  "footer": "DSA v3 · Quantitative Engine · Protected Workspace"
}
```

- [ ] **Step 2: Create `src/i18n/locales/en/login.json`**

```json
{
  "title": "Login - DSA",
  "firstTimeSetup": "Initial Setup",
  "pageTitle": "Admin Login",
  "description": {
    "firstTime": "First-time authentication setup. Please set an admin password for the workspace.",
    "normal": "Access to the DSA quantitative engine requires valid credentials."
  },
  "fields": {
    "passwordFirstTime": "Admin Password",
    "password": "Password",
    "passwordPlaceholder": "Set a password (min 6 characters)",
    "loginPlaceholder": "Enter your password",
    "confirmPassword": "Confirm Password",
    "confirmPlaceholder": "Re-enter your admin password"
  },
  "buttons": {
    "settingUp": "Setting up...",
    "connecting": "Connecting...",
    "setupAndLogin": "Complete Setup & Login",
    "login": "Login"
  },
  "errors": {
    "setupFailed": "Setup failed",
    "authFailed": "Authentication failed",
    "passwordMismatch": "Passwords do not match"
  },
  "footer": "DSA v3 · Quantitative Engine · Protected Workspace"
}
```

- [ ] **Step 3: Add `login` namespace to `src/i18n/index.ts`**

- [ ] **Step 4: Translate `src/pages/LoginPage.tsx`**

```ts
const { t } = useTranslation('login');
document.title = t('login:title');
// Replace every hardcoded string with t('login:...')
```

- [ ] **Step 5: Build and verify**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ src/pages/LoginPage.tsx
git commit -m "feat(i18n): add login namespace and translate LoginPage"
```

---

## Task 7: `settings` namespace + translate SettingsPage and settings components

**Files:**
- Create: `src/i18n/locales/zh/settings.json`
- Create: `src/i18n/locales/en/settings.json`
- Modify: `src/i18n/index.ts`
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `src/components/settings/AuthSettingsCard.tsx`
- Modify: `src/components/settings/ChangePasswordCard.tsx`
- Modify: `src/components/settings/SettingsCategoryNav.tsx`
- Modify: `src/components/settings/SettingsField.tsx`
- Modify: `src/components/settings/LLMChannelEditor.tsx`
- Modify: `src/components/settings/IntelligentImport.tsx`

- [ ] **Step 1: Create `src/i18n/locales/zh/settings.json`**

Cover all strings from the settings page and settings components inventory:

```json
{
  "title": "系统设置 - DSA",
  "pageTitle": "系统设置",
  "description": "统一管理模型、数据源、通知、安全认证与导入能力。",
  "actions": {
    "reset": "重置",
    "save": "保存配置",
    "saving": "保存中...",
    "retrySave": "重试保存",
    "retryLoad": "重试加载",
    "reload": "重新加载"
  },
  "alerts": {
    "success": "操作成功"
  },
  "sections": {
    "smartImport": {
      "title": "智能导入",
      "description": "从图片、文件或剪贴板中提取股票代码，并合并到自选股列表。"
    },
    "llmChannels": {
      "title": "LLM 渠道与模型",
      "description": "统一管理渠道协议、基础地址、API Key、主模型与回退模型。"
    },
    "currentCategory": {
      "title": "当前分类配置项",
      "description": "使用统一字段卡片维护当前分类的系统配置。"
    },
    "noItems": "当前分类下暂无配置项。"
  },
  "auth": {
    "title": "认证与登录保护",
    "enabled": "已启用",
    "disabled": "未启用",
    "enableButton": "开启认证",
    "disableButton": "关闭认证",
    "keepEnabledButton": "保持已开启",
    "keepDisabledButton": "保持已关闭",
    "passwordRequired": "设置新密码是必填项",
    "passwordMismatch": "两次输入的新密码不一致",
    "successEnabled": "认证设置已更新",
    "successDisabled": "认证已关闭"
  },
  "changePassword": {
    "title": "修改密码",
    "currentPassword": "当前密码",
    "newPassword": "新密码",
    "confirmPassword": "确认新密码",
    "submit": "修改密码",
    "submitting": "提交中...",
    "success": "管理员密码已更新。"
  },
  "categoryNav": {
    "label": "配置分类",
    "subtitle": "按模块整理系统设置与认证能力。"
  },
  "field": {
    "placeholder": "请选择",
    "enabled": "已启用",
    "disabled": "未启用",
    "delete": "删除",
    "addKey": "添加 Key",
    "sensitive": "敏感",
    "readonly": "只读",
    "sensitiveHint": "敏感内容默认隐藏，可点击眼睛图标查看明文。"
  },
  "llmChannel": {
    "modelsConfigured": "{{count}} 个模型已配置",
    "noModels": "未配置模型",
    "providers": {
      "aihubmix": "AIHubmix（聚合平台）",
      "deepseek": "DeepSeek 官方",
      "dashscope": "通义千问（Dashscope）",
      "zhipu": "智谱 GLM",
      "moonshot": "Moonshot（月之暗面）",
      "siliconflow": "硅基流动（SiliconFlow）",
      "gemini": "Gemini 官方",
      "anthropic": "Anthropic 官方",
      "openai": "OpenAI 官方",
      "ollama": "Ollama（本地）",
      "custom": "自定义渠道"
    }
  },
  "import": {
    "confidence": {
      "high": "高",
      "medium": "中",
      "low": "低"
    }
  }
}
```

- [ ] **Step 2: Create `src/i18n/locales/en/settings.json`**

```json
{
  "title": "Settings - DSA",
  "pageTitle": "Settings",
  "description": "Manage models, data sources, notifications, authentication, and import capabilities.",
  "actions": {
    "reset": "Reset",
    "save": "Save Config",
    "saving": "Saving...",
    "retrySave": "Retry Save",
    "retryLoad": "Retry Load",
    "reload": "Reload"
  },
  "alerts": {
    "success": "Operation successful"
  },
  "sections": {
    "smartImport": {
      "title": "Smart Import",
      "description": "Extract stock codes from images, files, or clipboard and merge into your watchlist."
    },
    "llmChannels": {
      "title": "LLM Channels & Models",
      "description": "Manage channel protocols, base URLs, API keys, primary and fallback models."
    },
    "currentCategory": {
      "title": "Category Config Items",
      "description": "Manage system configuration for the current category using unified field cards."
    },
    "noItems": "No configuration items in this category."
  },
  "auth": {
    "title": "Authentication & Login Protection",
    "enabled": "Enabled",
    "disabled": "Disabled",
    "enableButton": "Enable Auth",
    "disableButton": "Disable Auth",
    "keepEnabledButton": "Keep Enabled",
    "keepDisabledButton": "Keep Disabled",
    "passwordRequired": "New password is required",
    "passwordMismatch": "New passwords do not match",
    "successEnabled": "Authentication settings updated",
    "successDisabled": "Authentication disabled"
  },
  "changePassword": {
    "title": "Change Password",
    "currentPassword": "Current Password",
    "newPassword": "New Password",
    "confirmPassword": "Confirm New Password",
    "submit": "Change Password",
    "submitting": "Submitting...",
    "success": "Admin password updated."
  },
  "categoryNav": {
    "label": "Config Categories",
    "subtitle": "Organize system settings and authentication by module."
  },
  "field": {
    "placeholder": "Select...",
    "enabled": "Enabled",
    "disabled": "Disabled",
    "delete": "Delete",
    "addKey": "Add Key",
    "sensitive": "Sensitive",
    "readonly": "Read-only",
    "sensitiveHint": "Sensitive content is hidden by default. Click the eye icon to reveal."
  },
  "llmChannel": {
    "modelsConfigured": "{{count}} model(s) configured",
    "noModels": "No models configured",
    "providers": {
      "aihubmix": "AIHubmix (Aggregator)",
      "deepseek": "DeepSeek Official",
      "dashscope": "Qwen (Dashscope)",
      "zhipu": "Zhipu GLM",
      "moonshot": "Moonshot (Kimi)",
      "siliconflow": "SiliconFlow",
      "gemini": "Gemini Official",
      "anthropic": "Anthropic Official",
      "openai": "OpenAI Official",
      "ollama": "Ollama (Local)",
      "custom": "Custom Channel"
    }
  },
  "import": {
    "confidence": {
      "high": "High",
      "medium": "Medium",
      "low": "Low"
    }
  }
}
```

- [ ] **Step 3: Add `settings` namespace to `src/i18n/index.ts`**

- [ ] **Step 4: Translate `src/pages/SettingsPage.tsx` and all settings components**

Use `useTranslation('settings')` in each file and replace every hardcoded Chinese string with the corresponding `t('settings:...')` key.

- [ ] **Step 5: Build and verify**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ src/pages/SettingsPage.tsx src/components/settings/
git commit -m "feat(i18n): add settings namespace and translate SettingsPage + settings components"
```

---

## Task 8: `backtest` namespace + translate BacktestPage

**Files:**
- Create: `src/i18n/locales/zh/backtest.json`
- Create: `src/i18n/locales/en/backtest.json`
- Modify: `src/i18n/index.ts`
- Modify: `src/pages/BacktestPage.tsx`

- [ ] **Step 1: Create both `backtest.json` files**

`zh`:
```json
{ "title": "策略回测 - DSA" }
```

`en`:
```json
{ "title": "Strategy Backtest - DSA" }
```

- [ ] **Step 2: Add `backtest` namespace to `src/i18n/index.ts`**

- [ ] **Step 3: Translate `BacktestPage.tsx`**

```ts
const { t } = useTranslation('backtest');
document.title = t('backtest:title');
```

- [ ] **Step 4: Build, verify, and commit**

```bash
npm run build
git add src/i18n/ src/pages/BacktestPage.tsx
git commit -m "feat(i18n): add backtest namespace and translate BacktestPage"
```

---

## Task 9: `chat` namespace + translate ChatPage

**Files:**
- Create: `src/i18n/locales/zh/chat.json`
- Create: `src/i18n/locales/en/chat.json`
- Modify: `src/i18n/index.ts`
- Modify: `src/pages/ChatPage.tsx`
- Modify: `src/utils/chatExport.ts`

- [ ] **Step 1: Create `src/i18n/locales/zh/chat.json`**

```json
{
  "title": "策略问股 - DSA",
  "pageHeading": "问股",
  "pageSubtitle": "向 AI 询问个股分析，获取基于策略的交易建议与实时决策报告。",
  "quickQuestions": [
    "用缠论分析茅台",
    "波浪理论看宁德时代",
    "分析比亚迪趋势",
    "箱体震荡策略看中芯国际",
    "分析腾讯 hk00700",
    "用情绪周期分析东方财富"
  ],
  "input": {
    "placeholder": "例如：分析 600519 / 茅台现在适合买入吗？ (Enter 发送, Shift+Enter 换行)",
    "send": "发送"
  },
  "strategy": {
    "label": "策略",
    "generic": "通用分析",
    "fallback": "通用"
  },
  "history": {
    "title": "历史对话",
    "newChat": "开启新对话",
    "loading": "加载中...",
    "empty": "暂无历史对话",
    "messageCount": "{{count}} 条对话",
    "switchTo": "切换到对话 {{title}}",
    "delete": "删除",
    "mobileTitle": "历史对话"
  },
  "thinking": {
    "summary": "{{toolCount}} 个工具调用 · {{duration}}s",
    "title": "思考过程",
    "step": "第 {{step}} 步：思考",
    "generating": "生成分析"
  },
  "stage": {
    "connecting": "正在连接...",
    "thinking": "AI 正在思考...",
    "toolDone": "{{toolName}} 完成",
    "generating": "正在生成最终分析...",
    "processing": "处理中..."
  },
  "actions": {
    "export": "导出会话为 Markdown 文件",
    "exportLabel": "导出会话",
    "send": "发送到已配置的通知机器人/邮箱",
    "sendSuccess": "已发送到通知渠道",
    "sendFailed": "发送失败"
  },
  "emptyState": {
    "heading": "开始问股",
    "description": "输入「分析 600519」或「茅台现在能买吗」，AI 将调用实时数据工具为您生成决策报告。"
  },
  "deleteConfirm": {
    "title": "删除对话",
    "message": "删除后，该对话将不可恢复，确认删除吗？",
    "confirm": "删除"
  },
  "followUp": "请深入分析 {{name}}"
}
```

- [ ] **Step 2: Create `src/i18n/locales/en/chat.json`**

```json
{
  "title": "Stock Chat - DSA",
  "pageHeading": "Ask AI",
  "pageSubtitle": "Ask AI for individual stock analysis and get strategy-based trading advice and real-time decision reports.",
  "quickQuestions": [
    "Analyze Moutai with Chan Theory",
    "Wave theory on CATL",
    "Analyze BYD trend",
    "Box oscillation strategy on SMIC",
    "Analyze Tencent hk00700",
    "Analyze East Money with sentiment cycle"
  ],
  "input": {
    "placeholder": "e.g. Analyze 600519 / Is Moutai a buy now? (Enter to send, Shift+Enter for new line)",
    "send": "Send"
  },
  "strategy": {
    "label": "Strategy",
    "generic": "General Analysis",
    "fallback": "General"
  },
  "history": {
    "title": "Chat History",
    "newChat": "New Chat",
    "loading": "Loading...",
    "empty": "No chat history",
    "messageCount": "{{count}} message(s)",
    "switchTo": "Switch to {{title}}",
    "delete": "Delete",
    "mobileTitle": "Chat History"
  },
  "thinking": {
    "summary": "{{toolCount}} tool call(s) · {{duration}}s",
    "title": "Thinking Process",
    "step": "Step {{step}}: Thinking",
    "generating": "Generating Analysis"
  },
  "stage": {
    "connecting": "Connecting...",
    "thinking": "AI is thinking...",
    "toolDone": "{{toolName}} done",
    "generating": "Generating final analysis...",
    "processing": "Processing..."
  },
  "actions": {
    "export": "Export session as Markdown",
    "exportLabel": "Export",
    "send": "Send to configured notification channel",
    "sendSuccess": "Sent to notification channel",
    "sendFailed": "Send failed"
  },
  "emptyState": {
    "heading": "Start Chatting",
    "description": "Type \"Analyze 600519\" or \"Is Moutai a buy now?\" and AI will generate a decision report using real-time data tools."
  },
  "deleteConfirm": {
    "title": "Delete Chat",
    "message": "This chat cannot be recovered after deletion. Are you sure?",
    "confirm": "Delete"
  },
  "followUp": "Please do a deep analysis of {{name}}"
}
```

- [ ] **Step 3: Add `chat` namespace to `src/i18n/index.ts`**

- [ ] **Step 4: Translate `src/pages/ChatPage.tsx`**

Key patterns:
```ts
const { t, i18n } = useTranslation('chat');
document.title = t('chat:title');
// QUICK_QUESTIONS labels are translated but strategy keys are preserved as a static constant:
const QUICK_QUESTION_STRATEGIES = ['chan_theory', 'wave_theory', 'trend', 'box_oscillation', 'general', 'sentiment'] as const;
const quickLabels = t('chat:quickQuestions', { returnObjects: true }) as string[];
const QUICK_QUESTIONS = QUICK_QUESTION_STRATEGIES.map((strategy, i) => ({
  label: quickLabels[i] ?? strategy,
  strategy,
}));

Also update the `chat.json` quickQuestions entries to be a flat array of label strings only (no strategy keys in JSON — those stay in code).

// date locale:
toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', ...)
// getCurrentStage():
case 'thinking': return t('chat:stage.thinking');
// ... etc
```

- [ ] **Step 5: Translate `src/utils/chatExport.ts`**

Accept a `t` function parameter or call `i18n.t()` directly:
```ts
import i18n from '../i18n';
// Use i18n.t('chat:...') for headings and filename
```

Also fix the `toLocaleString` call (line ~8): replace hardcoded `'zh-CN'` with dynamic locale using `i18n.language.startsWith('zh') ? 'zh-CN' : 'en-US'`.

- [ ] **Step 6: Build and verify**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/i18n/ src/pages/ChatPage.tsx src/utils/chatExport.ts
git commit -m "feat(i18n): add chat namespace and translate ChatPage"
```

---

## Task 10: `portfolio` namespace + translate PortfolioPage

**Files:**
- Create: `src/i18n/locales/zh/portfolio.json`
- Create: `src/i18n/locales/en/portfolio.json`
- Modify: `src/i18n/index.ts`
- Modify: `src/pages/PortfolioPage.tsx`

- [ ] **Step 1: Create `src/i18n/locales/zh/portfolio.json`**

Cover all strings from the PortfolioPage inventory (the largest page). Key groups:

```json
{
  "title": "持仓分析 - DSA",
  "pageTitle": "持仓管理",
  "pageSubtitle": "组合快照、手工录入、CSV 导入与风险分析（支持全组合 / 单账户切换）",
  "brokerWarning": {
    "empty": "券商列表接口返回为空，已回退为内置券商列表（华泰/中信/招商）。",
    "unavailable": "券商列表接口不可用，已回退为内置券商列表（华泰/中信/招商）。"
  },
  "riskWarning": "风险数据获取失败，已降级为仅展示快照数据。",
  "writeWarning": {
    "selectAccount": "请先在右上角选择具体账户，再进行录入或导入提交。",
    "selectAccountForDelete": "请先在右上角选择具体账户，再进行删除修正。"
  },
  "accountView": "账户视图",
  "allAccounts": "全部账户",
  "costMethod": "成本口径",
  "costMethods": {
    "fifo": "先进先出（FIFO）",
    "avg": "均价成本（AVG）"
  },
  "createAccount": {
    "collapse": "收起新建",
    "expand": "新建账户",
    "heading": "新建账户",
    "creating": "创建中...",
    "submit": "创建账户",
    "autoSwitch": "创建后自动切换到该账户",
    "namePlaceholder": "账户名称（必填）",
    "brokerPlaceholder": "券商（可选，如 Demo/华泰）",
    "currencyPlaceholder": "基准币（如 CNY/USD/HKD）",
    "markets": {
      "cn": "市场：A 股（cn）",
      "hk": "市场：港股（hk）",
      "us": "市场：美股（us）"
    },
    "nameRequired": "账户名称不能为空。",
    "success": "账户创建成功，已自动切换到该账户。",
    "failed": "创建账户失败，请稍后重试。",
    "collapseButton": "收起"
  },
  "refresh": {
    "loading": "刷新中...",
    "label": "刷新数据"
  },
  "noAccounts": "还没有可用账户，请先创建账户后再录入交易或导入 CSV。",
  "riskWarningLabel": "风险模块降级：{{message}}",
  "writeWarningLabel": "操作提示：{{message}}",
  "stats": {
    "totalEquity": "总权益",
    "totalMarketValue": "总市值",
    "totalCash": "总现金",
    "fxStatus": "汇率状态",
    "fxStale": "过期",
    "fxFresh": "最新"
  },
  "positions": {
    "title": "持仓明细",
    "count": "共 {{count}} 项",
    "empty": "当前无持仓数据",
    "headers": {
      "account": "账户",
      "code": "代码",
      "qty": "数量",
      "avgCost": "均价",
      "currentPrice": "现价",
      "marketValue": "市值",
      "unrealizedPnl": "未实现盈亏"
    }
  },
  "concentration": {
    "industry": "行业集中度分布",
    "stock": "行业数据暂不可用，当前展示个股集中度",
    "empty": "暂无集中度数据",
    "dimension": "展示口径",
    "industryDim": "行业维度",
    "stockDimFallback": "个股维度（降级显示）",
    "sectorAlert": "板块集中度告警",
    "yes": "是",
    "no": "否",
    "top1Weight": "Top1 权重"
  },
  "allAccountsWarning": "当前处于\"全部账户\"视图。为避免误写，请先选择一个具体账户后再进行手工录入或 CSV 提交。",
  "risk": {
    "drawdown": {
      "title": "回撤监控",
      "max": "最大回撤",
      "current": "当前回撤",
      "alert": "告警"
    },
    "stopLoss": {
      "title": "止损接近预警",
      "triggered": "触发数",
      "approaching": "接近数",
      "alert": "告警"
    },
    "scope": {
      "title": "口径",
      "accountCount": "账户数",
      "currency": "计价币种",
      "costMethod": "成本法"
    }
  },
  "trade": {
    "title": "手工录入：交易",
    "codePlaceholder": "股票代码（例如 600519）",
    "buy": "买入",
    "sell": "卖出",
    "qtyPlaceholder": "数量（必填）",
    "pricePlaceholder": "成交价（必填）",
    "commissionPlaceholder": "手续费（可选）",
    "taxPlaceholder": "税费（可选）",
    "hint": "手续费和税费可留空，系统将按 0 处理。",
    "submit": "提交交易"
  },
  "cash": {
    "title": "手工录入：资金流水",
    "inflow": "流入",
    "outflow": "流出",
    "amountPlaceholder": "金额",
    "currencyPlaceholder": "币种（可选，默认 {{defaultCurrency}}）",
    "submit": "提交资金流水"
  },
  "corporate": {
    "title": "手工录入：公司行为",
    "codePlaceholder": "股票代码",
    "cashDividend": "现金分红",
    "splitAdjustment": "拆并股调整",
    "dividendPlaceholder": "每股分红",
    "ratioPlaceholder": "拆并股比例",
    "submit": "提交企业行为"
  },
  "csv": {
    "title": "券商 CSV 导入",
    "selectFile": "选择 CSV",
    "dryRun": "仅预演（不写入）",
    "parse": "解析文件",
    "parsing": "解析中...",
    "commit": "提交导入",
    "committing": "提交中...",
    "parseResult": "解析结果：有效 {{valid}} 条，跳过 {{skipped}} 条，错误 {{errors}} 条",
    "commitResult": "提交结果：写入 {{written}} 条，重复 {{duplicates}} 条，失败 {{failed}} 条"
  },
  "events": {
    "title": "事件记录",
    "trades": "交易流水",
    "cash": "资金流水",
    "corporate": "公司行为",
    "refresh": "刷新流水",
    "refreshing": "加载中...",
    "filterByCode": "按股票代码筛选",
    "allDirections": "全部买卖方向",
    "buy": "买入",
    "sell": "卖出",
    "allCashDirections": "全部资金方向",
    "inflow": "流入",
    "outflow": "流出",
    "allCorporate": "全部公司行为",
    "cashDividend": "现金分红",
    "splitAdjustment": "拆并股调整",
    "deleteHint": "删除修正仅在单账户视图可用。请先选择具体账户后再删除错误流水。",
    "correctionHint": "如有错误流水，可直接删除后重新录入。",
    "empty": "暂无流水",
    "pagination": "第 {{page}} / {{total}} 页",
    "prevPage": "上一页",
    "nextPage": "下一页",
    "deleteButton": "删除"
  },
  "deleteConfirm": {
    "title": "删除错误流水",
    "message": "确认删除这条流水吗？",
    "confirm": "确认删除",
    "confirming": "删除中..."
  },
  "labels": {
    "buy": "买入",
    "sell": "卖出",
    "inflow": "流入",
    "outflow": "流出",
    "cashDividend": "现金分红",
    "splitAdjustment": "拆并股调整"
  },
  "fallbackBrokers": {
    "huatai": "华泰",
    "citic": "中信",
    "cmb": "招商"
  }
}
```

- [ ] **Step 2: Create `src/i18n/locales/en/portfolio.json`**

Create with the SAME key structure as `zh/portfolio.json`. Translate every string value to English. Key translations:
- "持仓分析 - DSA" → "Portfolio Analysis - DSA"
- "持仓管理" → "Portfolio Management"
- "全部账户" → "All Accounts"
- "先进先出（FIFO）" → "First In First Out (FIFO)"
- "均价成本（AVG）" → "Average Cost (AVG)"
- "市场：A 股（cn）" → "Market: A-Shares (cn)"
- "市场：港股（hk）" → "Market: HK Stocks (hk)"
- "市场：美股（us）" → "Market: US Stocks (us)"
- "账户名称（必填）" → "Account Name (required)"
- "券商（可选，如 Demo/华泰）" → "Broker (optional, e.g. Demo/Huatai)"
- "基准币（如 CNY/USD/HKD）" → "Base Currency (e.g. CNY/USD/HKD)"
- "总权益" → "Total Equity"
- "总市值" → "Total Market Value"
- "总现金" → "Total Cash"
- "汇率状态" → "FX Status"
- "过期" → "Stale"
- "最新" → "Live"
- "持仓明细" → "Position Details"
- "当前无持仓数据" → "No position data"
- All other keys follow the pattern established in zh/portfolio.json

The agent implementing this step must produce a complete JSON file matching every key in `zh/portfolio.json`.

- [ ] **Step 3: Add `portfolio` namespace to `src/i18n/index.ts`**

- [ ] **Step 4: Translate `src/pages/PortfolioPage.tsx`**

Also fix `formatMoney` (line ~53): replace hardcoded `'zh-CN'` locale in `toLocaleString` with:
```ts
const locale = i18n.language.startsWith('zh') ? 'zh-CN' : 'en-US';
Number(value).toLocaleString(locale, { ... });
```

The helper functions `formatSideLabel`, `formatCashDirectionLabel`, `formatCorporateActionLabel` need to accept `t`:

```ts
const { t } = useTranslation('portfolio');

const formatSideLabel = (side: string) =>
  side === 'buy' ? t('portfolio:labels.buy') : t('portfolio:labels.sell');

const formatCashDirectionLabel = (dir: string) =>
  dir === 'inflow' ? t('portfolio:labels.inflow') : t('portfolio:labels.outflow');

const formatCorporateActionLabel = (type: string) =>
  type === 'cash_dividend' ? t('portfolio:labels.cashDividend') : t('portfolio:labels.splitAdjustment');
```

Translate all other strings using `t('portfolio:...')`.

- [ ] **Step 5: Build and verify**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ src/pages/PortfolioPage.tsx
git commit -m "feat(i18n): add portfolio namespace and translate PortfolioPage"
```

---

## Task 11: Translate remaining components (history, tasks, report)

**Files:**
- Modify: `src/components/history/HistoryList.tsx`
- Modify: `src/components/tasks/TaskPanel.tsx`
- Modify: `src/components/report/ReportNews.tsx`
- Modify: `src/components/report/ReportMarkdown.tsx`
- Modify: `src/components/report/ReportDetails.tsx`
- Modify: `src/components/report/ReportOverview.tsx`
- Modify: `src/components/report/ReportSummary.tsx`
- Modify: `src/components/report/ReportStrategy.tsx`
- Modify: `src/pages/NotFoundPage.tsx`
- Modify: `src/utils/format.ts`
- Add keys to existing namespace JSON files as needed

- [ ] **Step 1: Add shared component strings to `common.json` (both locales)**

Add to `zh/common.json`:
```json
"history": {
  "title": "历史分析",
  "selected": "已选 {{count}}",
  "selectAllLabel": "全选当前已加载历史记录",
  "selectAll": "全选当前",
  "deleting": "删除中",
  "delete": "删除",
  "empty": "暂无历史分析记录",
  "emptyDesc": "完成首次分析后，这里会保留最近结果。",
  "bottom": "已到底部"
},
"task": {
  "analyzing": "分析中",
  "waiting": "等待中",
  "defaultTitle": "分析任务",
  "processing": "{{count}} 进行中",
  "pending": "{{count}} 等待中"
},
"report": {
  "relatedNews": "相关资讯",
  "refresh": "刷新",
  "retry": "重试",
  "loading": "加载资讯中...",
  "noNews": "暂无相关资讯",
  "jump": "跳转",
  "fullReport": "完整分析报告",
  "loadingReport": "加载报告中...",
  "loadFailed": "加载报告失败",
  "dataTrace": "数据追溯",
  "rawResult": "原始分析结果",
  "analysisSnapshot": "分析快照",
  "noConclusion": "暂无分析结论",
  "operationAdvice": "操作建议",
  "noAdvice": "暂无建议",
  "trendForecast": "趋势预测",
  "noForecast": "暂无预测",
  "modelUsed": "分析模型: {{model}}",
  "idealBuy": "理想买入",
  "secondBuy": "二次买入",
  "stopLoss": "止损价位",
  "takeProfit": "止盈目标",
  "sniperPoints": "狙击点位"
},
"scoreGauge": {
  "label": "恐惧贪婪指数"
},
"chatBadge": {
  "newMessage": "问股有新消息"
},
"format": {
  "reportType": {
    "simple": "普通",
    "detailed": "标准"
  }
}
```

And the English equivalents in `en/common.json`.

- [ ] **Step 2: Translate `HistoryList.tsx`**

```ts
const { t } = useTranslation('common');
// Use t('history.title'), t('history.selected', { count }), etc.
```

Also translate the `getOperationBadgeLabel` function. Move it inside the component (or pass `t` as parameter) and use translation keys:
```ts
const getOperationBadgeLabel = (advice: string, t: TFunction) => {
  if (advice.includes('减仓') || advice.includes('情绪')) return t('common:operationBadge.reduce');
  if (advice.includes('卖')) return t('common:operationBadge.sell');
  if (advice.includes('观望') || advice.includes('等待')) return t('common:operationBadge.hold');
  if (advice.includes('买') || advice.includes('布局')) return t('common:operationBadge.buy');
  return t('common:operationBadge.advice');
};
```
Add to `zh/common.json` and `en/common.json` under `operationBadge`:
- zh: `{ "reduce": "减仓", "sell": "卖出", "hold": "观望", "buy": "买入", "advice": "建议" }`
- en: `{ "reduce": "Reduce", "sell": "Sell", "hold": "Hold", "buy": "Buy", "advice": "Advice" }`

- [ ] **Step 3: Translate `TaskPanel.tsx`**

```ts
const { t } = useTranslation('common');
// status badge: t('task.analyzing'), t('task.waiting')
// etc.
```

- [ ] **Step 4: Translate all report components**

Each gets `const { t } = useTranslation('common')` and uses `t('report.*')` keys.

- [ ] **Step 4b: Translate `ScoreGauge.tsx` line 93**

```ts
const { t } = useTranslation('common');
// Replace '恐惧贪婪指数' with:
{t('scoreGauge.label')}
```

- [ ] **Step 5: Translate `NotFoundPage.tsx`**

```ts
const { t } = useTranslation('common');
document.title = t('notFound.title');
// headings and button use t('notFound.*')
```

- [ ] **Step 6: Translate `src/utils/format.ts`**

```ts
import i18n from '../i18n';
// Replace '普通' / '标准' with i18n.t('format.reportType.simple') etc.
```

- [ ] **Step 6b: Fix locale-aware date formatting in `src/utils/format.ts`**

```ts
import i18n from '../i18n';

// In formatDateTime and formatDate, replace hardcoded 'zh-CN' with:
const locale = i18n.language.startsWith('zh') ? 'zh-CN' : 'en-US';
```

- [ ] **Step 7: Build and verify**

```bash
npm run build
```

- [ ] **Step 8: Run lint**

```bash
npm run lint
```

Fix any ESLint warnings (especially missing `useCallback` / `useEffect` deps if `t` is added).

- [ ] **Step 9: Commit**

```bash
git add src/components/history/ src/components/tasks/ src/components/report/ src/pages/NotFoundPage.tsx src/utils/format.ts src/i18n/
git commit -m "feat(i18n): translate history, task, report components, NotFoundPage, format util"
```

---

## Task 12: Final build verification and lint

**Files:** No changes — verification only.

- [ ] **Step 1: Full lint**

```bash
cd apps/dsa-web && npm run lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 2: Full build**

```bash
npm run build
```

Expected: build succeeds, no TypeScript errors.

- [ ] **Step 3: Smoke-test language switching**

Run dev server and manually verify:
```bash
npm run dev
```

1. App loads in Chinese (default).
2. Click language toggle in ShellHeader → UI switches to English.
3. Reload page → English persists (localStorage).
4. Click toggle again → switches back to Chinese.
5. Navigate all pages — no untranslated Chinese strings visible in English mode.

- [ ] **Step 4: Final commit if any cleanup needed**

```bash
git add -p   # stage only intentional changes
git commit -m "fix(i18n): cleanup after full translation pass"
```

---

## Notes

- `src/utils/systemConfigI18n.ts` is **not translated** — it maps backend config keys to display labels used only in the Settings form. These are tech-facing field names (env var descriptions), not navigation UI. Leave as-is.
- The `ScoreGauge` component label `恐惧贪婪指数` maps to `t('scoreGauge.label')` in `common`.
- All `document.title` strings should be translated using the page-specific namespace.
- If a component uses `t()` inside a non-component function (e.g. `chatExport.ts`), use `i18n.t()` from the i18n instance directly rather than the hook.
- `i18next-browser-languagedetector` detects `zh-CN` from the browser, which matches `zh` fallback — this is correct because i18next performs prefix matching (`zh-CN` → `zh`).

---

## Task 13: Frontend — Add language header to API requests

**Files:**
- Modify: `apps/dsa-web/src/api/index.ts`
- Modify: `apps/dsa-web/src/api/agent.ts` (for fetch-based streaming call)

**Goal:** Send the current UI language to the backend so it can generate reports in the correct language.

- [ ] **Step 1: Add language header to axios client**

In `src/api/index.ts`, add a request interceptor that injects the current i18n language:

```ts
import i18n from '../i18n';

// Add request interceptor to include language header
apiClient.interceptors.request.use((config) => {
  config.headers['X-Locale'] = i18n.language || 'zh';
  return config;
});
```

- [ ] **Step 2: Add language header to fetch-based streaming call**

In `src/api/agent.ts`, in the `chatStream` function using native `fetch`, add the header:

```ts
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Locale': i18n.language || 'zh',
  },
  body: JSON.stringify(payload),
  credentials: 'include',
  signal: options?.signal,
});
```

Import i18n at the top:
```ts
import i18n from '../i18n';
```

- [ ] **Step 3: Build and verify**

```bash
cd apps/dsa-web && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add apps/dsa-web/src/api/
git commit -m "feat(i18n): add X-Locale header to API requests"
```

---

## Task 14: Backend — Add language parameter to analysis and agent APIs

**Files:**
- Modify: `api/v1/schemas/analysis.py` (add locale field to request)
- Modify: `api/v1/endpoints/analysis.py` (extract locale, pass to service)
- Modify: `api/v1/endpoints/agent.py` (add locale field to ChatRequest, pass to executor)
- Modify: `src/services/analysis_service.py` (accept and pass locale to analyzer)
- Modify: `src/services/task_queue.py` (store locale with task, pass to analyzer)

- [ ] **Step 1: Add `locale` field to `AnalyzeRequest` schema**

In `api/v1/schemas/analysis.py`, add to the `AnalyzeRequest` model:

```python
class AnalyzeRequest(BaseModel):
    stock_code: Optional[str] = None
    stock_codes: Optional[List[str]] = None
    report_type: str = "detailed"
    force_refresh: bool = False
    async_mode: bool = True
    locale: str = Field(default="zh", description="Language locale: zh or en")
```

- [ ] **Step 2: Add `locale` field to `ChatRequest` schema**

In `api/v1/endpoints/agent.py`, add to `ChatRequest`:

```python
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    strategies: Optional[List[str]] = None
    context: Optional[Dict[str, Any]] = None
    locale: str = Field(default="zh", description="Language locale: zh or en")
```

- [ ] **Step 3: Modify analysis endpoint to extract and pass locale**

In `api/v1/endpoints/analysis.py`, extract the locale from header or body, and pass it through:

For the sync analysis path (`_handle_sync_analysis`), pass `request.locale` to the service.
For the async path (`_handle_async_analysis_batch`), pass locale to `submit_tasks_batch`.

- [ ] **Step 4: Modify task queue to store and pass locale**

In `src/services/task_queue.py`:
1. `TaskInfo` dataclass: add `locale: str = "zh"`
2. `submit_tasks_batch`: accept `locale` parameter, store in `TaskInfo`
3. When executing the task, pass `locale` to the analysis service

- [ ] **Step 5: Modify analysis service to accept locale**

In `src/services/analysis_service.py`:
1. `analyze_stock` method: add `locale: str = "zh"` parameter
2. Pass `locale` to the analyzer (e.g., `StockAnalyzer` or `AgentExecutor`)

- [ ] **Step 6: Modify agent executor to accept locale**

In `src/agent/executor.py`:
1. `AgentExecutor.chat()` method: add `locale: str = "zh"` parameter
2. Store locale in the executor context or pass to prompt builder

- [ ] **Step 7: Backend build/verify**

```bash
cd /Users/luisrosaneng/Workspace/daily_stock_analysis
python -m py_compile api/v1/schemas/analysis.py api/v1/endpoints/analysis.py api/v1/endpoints/agent.py
python -m py_compile src/services/analysis_service.py src/services/task_queue.py
python -m py_compile src/agent/executor.py
```

- [ ] **Step 8: Commit**

```bash
git add api/v1/schemas/analysis.py api/v1/endpoints/analysis.py api/v1/endpoints/agent.py
git add src/services/analysis_service.py src/services/task_queue.py src/agent/executor.py
git commit -m "feat(i18n): add locale parameter to analysis and agent APIs"
```

---

## Task 15: Backend — Make LLM prompts language-aware

**Files:**
- Modify: `src/analyzer.py` (`SYSTEM_PROMPT` → dynamic `build_system_prompt(locale)`)
- Modify: `src/agent/executor.py` (`AGENT_SYSTEM_PROMPT`, `CHAT_SYSTEM_PROMPT` → dynamic)
- Modify: `src/services/image_stock_extractor.py` (`EXTRACT_PROMPT` → dynamic)

**Goal:** Switch prompt language based on the `locale` parameter.

- [ ] **Step 1: Create prompt builder function in `src/analyzer.py`**

Replace the static `SYSTEM_PROMPT` with a function that returns Chinese or English based on locale:

```python
def build_system_prompt(locale: str = "zh") -> str:
    """Build system prompt in the requested language."""
    is_en = locale.startswith("en")

    if is_en:
        return """You are a trend-focused A-share investment analyst, responsible for generating professional decision dashboard analysis reports.

## Core Trading Philosophy (must strictly follow)

### 1. Strict Entry Strategy (No chasing highs)
- **Never chase highs**: When stock price deviates more than 5% from MA5, do NOT buy
- Bias ratio < 2%: Best buying range
- Bias ratio 2-5%: Small position acceptable
- Bias ratio > 5%: Strictly forbidden to chase! Directly judge as "wait and see"

### 2. Trend Trading (Follow the trend)
- **Bull arrangement required**: MA5 > MA10 > MA20
- Only trade stocks with bull arrangement, never touch bear arrangement
- Upward diverging MA is better than converging MA

[Continue with all prompt sections translated to English...]

## Output Format: Decision Dashboard JSON

Your final response must be a valid JSON object with the following structure:

```json
{
    "stock_name": "Stock Chinese Name",
    "sentiment_score": 0-100 integer,
    "trend_prediction": "Strongly Bullish/Bullish/Range-bound/Bearish/Strongly Bearish",
    "operation_advice": "Buy/Add Position/Hold/Reduce Position/Sell/Wait",
    "decision_type": "buy/hold/sell",
    "confidence_level": "High/Medium/Low",
    "dashboard": { ... }
}
```
"""
    else:
        # Return existing Chinese SYSTEM_PROMPT
        return SYSTEM_PROMPT
```

Then modify `analyze()` method to call `build_system_prompt(locale)` instead of using the constant.

- [ ] **Step 2: Create prompt builder functions in `src/agent/executor.py`**

Create `build_agent_system_prompt(locale)` and `build_chat_system_prompt(locale)` functions that return English or Chinese versions based on locale.

The English versions should:
- Translate all Chinese instructions
- Keep the same workflow stages (Market data → Tech analysis → Intel search → Report generation)
- Keep the same trading rules (strict entry, trend following, efficiency first, etc.)
- Output the same JSON structure but field descriptions in English

- [ ] **Step 3: Create prompt builder in `src/services/image_stock_extractor.py`**

Create `build_extract_prompt(locale)`:

```python
def build_extract_prompt(locale: str = "zh") -> str:
    if locale.startswith("en"):
        return """Please analyze this stock market screenshot or image and extract all visible stock codes and names.

Extract:
1. Stock codes (e.g., 600519, AAPL, 00700.HK)
2. Stock names (e.g., Kweichow Moutai, Apple, Tencent)

Return a JSON array:
[{"code": "600519", "name": "Kweichow Moutai"}, ...]

If no stock codes are visible, return an empty array [].
"""
    else:
        return EXTRACT_PROMPT  # Original Chinese
```

- [ ] **Step 4: Update TOOL_DISPLAY_NAMES in `agent.py` to be locale-aware**

In `api/v1/endpoints/agent.py`, the `TOOL_DISPLAY_NAMES` dict maps tool names to Chinese labels. This is used in the streaming response to show tool names to users.

Option 1: Make it a function that takes locale:
```python
def get_tool_display_names(locale: str = "zh") -> Dict[str, str]:
    if locale.startswith("en"):
        return {
            "get_realtime_quote": "Get Real-time Quote",
            "get_daily_history": "Get Historical Data",
            # ... English labels
        }
    return TOOL_DISPLAY_NAMES  # Chinese
```

- [ ] **Step 5: Backend verification**

```bash
cd /Users/luisrosaneng/Workspace/daily_stock_analysis
python -m py_compile src/analyzer.py src/agent/executor.py src/services/image_stock_extractor.py
```

Run any existing backend tests to ensure no regressions:
```bash
python -m pytest tests/test_analysis_api_contract.py -v -x 2>&1 | head -50
```

- [ ] **Step 6: Commit**

```bash
git add src/analyzer.py src/agent/executor.py src/services/image_stock_extractor.py
git add api/v1/endpoints/agent.py
git commit -m "feat(i18n): make LLM prompts language-aware with locale support"
```

---

## Task 16: End-to-end verification

**Files:** No changes — verification only.

- [ ] **Step 1: Start backend server**

```bash
cd /Users/luisrosaneng/Workspace/daily_stock_analysis
python server.py
```

- [ ] **Step 2: Start frontend dev server**

```bash
cd apps/dsa-web && npm run dev
```

- [ ] **Step 3: Test Chinese analysis (default)**

1. Open http://localhost:5173 (or the dev server URL)
2. Ensure language is Chinese (default)
3. Analyze a stock (e.g., 600519)
4. Verify the report is generated in Chinese

- [ ] **Step 4: Test English analysis**

1. Click the language toggle in ShellHeader to switch to English
2. Analyze the same or different stock
3. Verify the report is generated in English
4. Check that tool display names in agent chat are in English

- [ ] **Step 5: Test agent chat in both languages**

1. Go to Chat page
2. Test in Chinese mode — responses should be in Chinese
3. Switch to English
4. Test again — responses should be in English

- [ ] **Step 6: Run backend tests**

```bash
cd /Users/luisrosaneng/Workspace/daily_stock_analysis
./scripts/ci_gate.sh  # or the appropriate test command
```

- [ ] **Step 7: Final commit**

```bash
git commit --allow-empty -m "feat(i18n): complete bilingual support for UI and LLM reports (#english-version)"
```
