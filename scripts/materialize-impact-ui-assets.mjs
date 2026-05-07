/**
 * Published `impact-ui` "files" omits `src/assets` and `src/styles`, but `src/components` imports both.
 * Creates minimal placeholders for every referenced path so Vite/Rollup can resolve them.
 * Wired from package.json `postinstall`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const impactSrc = path.join(repoRoot, 'node_modules', 'impact-ui', 'src')

// #region agent log
const DEBUG_LOG = path.join(repoRoot, '.cursor', 'debug-304a3d.log')
function dbg(msg, data, hypothesisId) {
  try {
    const line = JSON.stringify({ sessionId: '304a3d', timestamp: Date.now(), location: 'materialize-impact-ui-assets.mjs', message: msg, data, hypothesisId }) + '\n'
    fs.mkdirSync(path.dirname(DEBUG_LOG), { recursive: true })
    fs.appendFileSync(DEBUG_LOG, line)
  } catch {}
}
// #endregion

const ASSET_RE =
  /\.\.\/\.\.\/assets\/([A-Za-z0-9_./-]+\.(?:svg|png|gif|jpg|jpeg))/g

const MINI_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"/>'

/** Always (re)written so Sidebar toggle + logout stay visible even after a prior empty run.
 *  Logout must use a real stroke colour: `<img src=…svg>` does not inherit CSS `color`, so
 *  `stroke="currentColor"` renders effectively black on the dark rail (invisible). */
const CRITICAL_SVGS = {
  'logout-icon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#41c893" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  'hamburger-close.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  'collapse-icon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>`,
  // Sparkle icon used by the gradient "Ask Alan" chatbot button (::after pseudo-element in Header SCSS)
  'smartBot.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/></svg>`,
  // Help icon (circle question mark) used in Header
  'help-icon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  // Notification bell used in Header
  'bell.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  // Message icon
  'message-icon.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  'message-icon-disabled.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  'notification-dnd.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`,
}

const MINI_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

const MINI_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
)

function walk(dir, out) {
  if (!fs.existsSync(dir)) return
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, out)
    else if (/\.(js|jsx|mjs|cjs|scss|css|ts|tsx)$/.test(ent.name)) {
      let txt
      try {
        txt = fs.readFileSync(p, 'utf8')
      } catch {
        continue
      }
      ASSET_RE.lastIndex = 0
      let m
      while ((m = ASSET_RE.exec(txt)) !== null) out.add(m[1])
    }
  }
}

function main() {
  if (!fs.existsSync(impactSrc)) {
    console.warn('[materialize-impact-ui-assets] skip: node_modules/impact-ui/src not found')
    return
  }

  const relPaths = new Set()
  walk(impactSrc, relPaths)

  const assetsRoot = path.join(impactSrc, 'assets')
  let created = 0
  let refreshed = 0
  let skipped = 0

  // A file is a "blank placeholder" if it is the exact empty SVG stub from a prior run.
  // In that case we always overwrite so icons are never silently invisible.
  function isBlankPlaceholder(dest) {
    if (!fs.existsSync(dest)) return false
    try {
      const content = fs.readFileSync(dest, 'utf8').trim()
      return content === MINI_SVG.trim()
    } catch {
      return false
    }
  }

  for (const rel of [...relPaths].sort()) {
    // Skip files that are already in CRITICAL_SVGS — the block below handles those.
    const baseName = path.basename(rel)
    if (baseName in CRITICAL_SVGS) continue

    const dest = path.join(assetsRoot, rel)
    const blank = isBlankPlaceholder(dest)

    if (fs.existsSync(dest) && !blank) {
      skipped++
      continue
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true })
    if (rel.endsWith('.svg')) fs.writeFileSync(dest, MINI_SVG, 'utf8')
    else if (rel.endsWith('.gif')) fs.writeFileSync(dest, MINI_GIF)
    else if (rel.endsWith('.png') || rel.endsWith('.jpg') || rel.endsWith('.jpeg'))
      fs.writeFileSync(dest, MINI_PNG)
    else continue

    if (blank) refreshed++
    else created++
  }

  for (const [name, svg] of Object.entries(CRITICAL_SVGS)) {
    const dest = path.join(assetsRoot, name)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, svg, 'utf8')
  }

  console.log(
    `[materialize-impact-ui-assets] ${relPaths.size} paths, ${created} new, ${refreshed} blank-refreshed, ${skipped} existed, critical SVGs always-rewritten → ${assetsRoot}`,
  )

  // ── src/styles/ — entire directory missing from published package ───────────
  // impact-ui package.json "files" only ships ["dist","src/stories","src/components"].
  // Every component SCSS does @import "../../styles/index.scss" (or deeper paths).
  // We must create the full variable set here so Sass can compile on Vercel.
  const stylesDir = path.join(impactSrc, 'styles')
  const stylesIndexPath = path.join(stylesDir, 'index.scss')

  // #region agent log
  dbg('styles check', { stylesDirExists: fs.existsSync(stylesDir), stylesIndexExists: fs.existsSync(stylesIndexPath) }, 'H1')
  // #endregion

  if (!fs.existsSync(stylesIndexPath)) {
    fs.mkdirSync(stylesDir, { recursive: true })
    fs.writeFileSync(
      stylesIndexPath,
      `// Impact Analytics Design Tokens — generated by materialize-impact-ui-assets (src/styles not in npm "files")

// Core colors
$primaryColor:            #4259EE;
$secondaryColor:          #3649C6;
$darkColor:               #0f1937;
$offDarkColor:            #1c2a4a;
$blackColor:              #000000;
$whiteColor:              #ffffff;
$white:                   #ffffff;
$offWhiteColor:           #f7f8fc;
$mainFontColor:           #1f2b4d;
$lightBlueColor:          #e8eaf6;
$lightBlueNavBarColor:    #dde0f6;
$lightGrayColor:          #f1f3f8;
$lightGrayFontColor:      #94a3b8;
$darkGrayColor:           #64748b;
$borderColor:             #e0e4f0;
$outerBorder:             #c7cde8;

// Success / indicators
$successIconColor:        #41c893;
$successBackground:       #ecfdf5;
$successStroke:           #6ee7b7;
$successToastStroke:      #34d399;
$greenBadge:              #d1fae5;
$greenBadgeDark:          #065f46;

// Warning
$warningBackground:       #fffbeb;
$warningStroke:           #fcd34d;
$warningAlertIcon:        #f59e0b;
$warningToastStroke:      #fbbf24;
$warningToastText:        #92400e;
$yellowBadge:             #fef9c3;
$yellowBadgeDark:         #713f12;
$yellowBadgeOutlined:     #ca8a04;
$yellowBadgeStrokeBg:     #fef08a;

// Error / Destructive
$errorBackground:         #fef2f2;
$errorColor:              #ef4444;
$errorStroke:             #fca5a5;
$redBadge:                #fee2e2;
$redBadgeStrokeBg:        #fecaca;
$redText:                 #b91c1c;
$destructiveBg:           #fee2e2;
$destructiveHoverBg:      #fecaca;
$destructiveFocusOutline: #f87171;
$destructiveSecondaryBg:  #fef2f2;
$destructiveSecondaryFocusOutline: #fca5a5;

// Info
$infoBackground:          #eff6ff;
$infoStroke:              #93c5fd;

// Subtle badge colors
$subtleDefaultColor:      #f1f5f9;
$subtleErrorColor:        #fef2f2;
$subtleErrorFontColor:    #b91c1c;
$subtleInfoColor:         #eff6ff;
$subtleSuccessColor:      #ecfdf5;
$subtleSuccessFontColor:  #065f46;
$subtleWarningColor:      #fffbeb;

// Primary badge
$primaryBadge:            #eceefd;

// Backgrounds & borders
$disabledSecondaryBg:     #e2e8f0;
$disabledSecondaryBorder: #e0e4f0;
$menuBorderColor:         #e0e4f0;
$inactiveInputBackground: #f8fafc;
$inputInfoColor:          #64748b;
$deactivateColor:         #94a3b8;
$chatbotBgColor:          #0f1937;
$avatarBgColor:           #4259EE;
$chatBotLightBlue:        #eff6ff;
$chatBotLightPink:        #fdf2f8;
$chatBotTextColor:        #1e293b;

// Accordion / stepper
$accordionBgBackground:   #f8fafc;
$accrodionBorderColor:    #e2e8f0;
$activeStepper:           #4259EE;
$StepperBorder:           #e0e4f0;

// Table
$tableTotalBgColor:       #f1f5f9;
$tableLavendarStroke:     #c7d2fe;

// Save-view
$saveViewBorderColor:     #e0e4f0;
$saveViewBoxShadowColor:  rgba(0,0,0,0.08);
$saveViewDefaultViewTextColor: #64748b;
$saveViewModalHeaderBgColor:   #f8fafc;

// Breadcrumbs
$breadCrumbsDot:          #94a3b8;

// Button states
$buttonHoverColor:        #3649C6;
$textButtonFontColor:     #4259EE;
$textButtonPrimaryBg:     #eceefd;

// Progress bar
$progressBarBg:           #e0e4f0;

// Misc
$boxShadowColor:    rgba(0,0,0,0.15);
$boxShadowLight:    0 1px 3px rgba(0,0,0,0.08);
$boxShadowMedium:   0 4px 12px rgba(0,0,0,0.12);
$boxShadowSoft:     0 2px 8px rgba(0,0,0,0.06);
$grayBadge:         #94a3b8;

// Typography
$fontFamily:        'Manrope', sans-serif;
$smallFontSize:     12px;
$normalFontSize:    14px;
$mediumFontSize:    16px;
$largeFontSize:     18px;
$regularFontWeight: 400;
$normalFontWeight:  400;
$semiBoldFontWeight:500;
$BoldFontWeight:    700;
$ExtraFontWeight:   600;

// Component sizes
$component16px:    16px;
$smallComponent:   32px;
$mediumComponent:  36px;
$Component48px:    48px;
$BigComponent:     40px;

// z-index layers
$LOW_1: 999;
$LOW_2: 1000;
$LOW_3: 1001;
$MID_1: 1100;
$MID_2: 1200;
$HIGH_1: 1300;
$HIGH_2: 1400;
$HIGH_3: 1500;

// Misc sizing / animation
$borderRadius:      8px;
$borderRadiusLarge: 12px;
$LOW:               100ms;
`,
      'utf8',
    )
    console.log('[materialize-impact-ui-assets] created styles/index.scss (missing from npm package)')
    // #region agent log
    dbg('created styles/index.scss', { path: stylesIndexPath }, 'H2')
    // #endregion
  } else {
    // #region agent log
    dbg('styles/index.scss already exists', { path: stylesIndexPath }, 'H2')
    // #endregion
  }

  // ── src/styles/base/ — color.scss and typography.scss (used by ChatBot/TableChat) ──
  const stylesBaseDir = path.join(stylesDir, 'base')
  const colorScssPath = path.join(stylesBaseDir, 'color.scss')
  const typographyScssPath = path.join(stylesBaseDir, 'typography.scss')
  if (!fs.existsSync(colorScssPath)) {
    fs.mkdirSync(stylesBaseDir, { recursive: true })
    fs.writeFileSync(colorScssPath, '// stub — forwards to parent index\n@import "../index.scss";\n', 'utf8')
    console.log('[materialize-impact-ui-assets] created styles/base/color.scss stub')
  }
  if (!fs.existsSync(typographyScssPath)) {
    fs.mkdirSync(stylesBaseDir, { recursive: true })
    fs.writeFileSync(typographyScssPath, '// stub — forwards to parent index\n@import "../index.scss";\n', 'utf8')
    console.log('[materialize-impact-ui-assets] created styles/base/typography.scss stub')
  }

  // #region agent log
  dbg('base stubs check', { colorExists: fs.existsSync(colorScssPath), typographyExists: fs.existsSync(typographyScssPath) }, 'H3')
  // #endregion

  // ── Select.styles.scss — patch missing $LOW_1/2/3 z-index variables ─────────
  // These variables are used inside Select.styles.scss but never defined anywhere
  // in the published package, causing a Sass "Undefined variable" build error.
  const selectScssPath = path.join(impactSrc, 'components', 'Select', 'Select.styles.scss')
  if (fs.existsSync(selectScssPath)) {
    let selectScss = fs.readFileSync(selectScssPath, 'utf8')
    const fallbackVars = '\n// z-index variables missing from the published package — defined here as fallbacks\n$LOW_1: 999 !default;\n$LOW_2: 1000 !default;\n$LOW_3: 1001 !default;\n'
    if (!selectScss.includes('$LOW_1:')) {
      selectScss = selectScss.replace('@import "../../styles/index.scss";', '@import "../../styles/index.scss";' + fallbackVars)
      fs.writeFileSync(selectScssPath, selectScss, 'utf8')
      console.log('[materialize-impact-ui-assets] patched Select.styles.scss with $LOW_1/2/3 fallbacks')
    }
  }

  // ── renderReactRoot.js ───────────────────────────────────────────────────────
  // impact-ui Portal component imports "../../renderReactRoot" which is missing
  // from the published package. Create a minimal stub so Vite/esbuild can resolve it.
  const renderReactRootPath = path.join(impactSrc, 'renderReactRoot.js')
  if (!fs.existsSync(renderReactRootPath)) {
    fs.writeFileSync(
      renderReactRootPath,
      [
        'import ReactDOM from "react-dom";',
        '',
        'export const renderPortal = (children, container) => {',
        '  if (!container) return Promise.resolve(null);',
        '  return Promise.resolve(ReactDOM.createPortal(children, container));',
        '};',
        '',
      ].join('\n'),
      'utf8',
    )
    console.log(`[materialize-impact-ui-assets] created renderReactRoot.js stub → ${renderReactRootPath}`)
  }
}

main()
