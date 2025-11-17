/**
 * Contrast Ratio Tester
 *
 * Tests key color combinations against WCAG AA standards.
 * WCAG AA requires:
 * - Normal text (< 18pt): 4.5:1 minimum
 * - Large text (>= 18pt): 3:1 minimum
 * - UI components: 3:1 minimum
 *
 * Run: npx tsx scripts/test-contrast.ts
 */

// Color definitions from our design system
const colors = {
  // Teal (Brand)
  'teal-50': '#F0FDFA',
  'teal-100': '#CCFBF1',
  'teal-400': '#2DD4BF',
  'teal-500': '#14B8A6',
  'teal-600': '#0D9488', // PRIMARY
  'teal-700': '#0F766E',
  'teal-800': '#115E59',

  // Amber (AI)
  'amber-50': '#FFFBEB',
  'amber-100': '#FEF3C7',
  'amber-500': '#F59E0B', // PRIMARY AI
  'amber-600': '#D97706',
  'amber-700': '#B45309',

  // Base
  'white': '#FFFFFF',
  'slate-50': '#F8FAFC',
  'slate-900': '#0F172A',
}

// Convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) throw new Error(`Invalid hex color: ${hex}`)

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ]
}

// Calculate relative luminance
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Calculate contrast ratio
function contrastRatio(color1: string, color2: string): number {
  const [r1, g1, b1] = hexToRgb(color1)
  const [r2, g2, b2] = hexToRgb(color2)

  const l1 = relativeLuminance(r1, g1, b1)
  const l2 = relativeLuminance(r2, g2, b2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

// Test result type
type TestResult = {
  fg: string
  bg: string
  ratio: number
  passAA_normal: boolean
  passAA_large: boolean
  passAAA_normal: boolean
  passAAA_large: boolean
}

// Test combinations
const tests: Array<{ fg: keyof typeof colors; bg: keyof typeof colors; context: string }> = [
  // Teal on white (buttons, links) - UPDATED to teal-700
  { fg: 'teal-700', bg: 'white', context: '✨ PRIMARY: Teal-700 text on white bg' },
  { fg: 'teal-600', bg: 'white', context: 'Teal-600 UI elements on white bg' },
  { fg: 'white', bg: 'teal-600', context: 'White text on teal-600 button' },
  { fg: 'white', bg: 'teal-700', context: 'White text on teal-700 button' },

  // Teal on light backgrounds
  { fg: 'teal-700', bg: 'slate-50', context: 'Teal-700 text on light gray surface' },
  { fg: 'teal-700', bg: 'teal-50', context: 'Dark teal on teal-50 (subtle bg)' },

  // Amber (AI) colors - UPDATED to amber-600/700
  { fg: 'white', bg: 'amber-600', context: '✨ AI BUTTON: White on amber-600' },
  { fg: 'white', bg: 'amber-700', context: 'White text on amber-700 (AI hover)' },
  { fg: 'amber-700', bg: 'amber-50', context: 'Dark amber on light amber (AI subtle)' },

  // Focus states - UPDATED
  { fg: 'teal-700', bg: 'white', context: '✨ FOCUS: Teal-700 ring on white' },
  { fg: 'amber-600', bg: 'white', context: 'Amber-600 focus ring on white' },
]

// Run tests
console.log('\n🎨 Design System Contrast Test\n')
console.log('=' .repeat(80))
console.log('\nWCAG AA Requirements:')
console.log('  • Normal text (< 18pt): 4.5:1 minimum')
console.log('  • Large text (>= 18pt): 3:1 minimum')
console.log('  • UI components: 3:1 minimum\n')
console.log('=' .repeat(80))

const results: TestResult[] = []

tests.forEach(({ fg, bg, context }) => {
  const ratio = contrastRatio(colors[fg], colors[bg])
  const result: TestResult = {
    fg: `${fg} (${colors[fg]})`,
    bg: `${bg} (${colors[bg]})`,
    ratio: Math.round(ratio * 100) / 100,
    passAA_normal: ratio >= 4.5,
    passAA_large: ratio >= 3.0,
    passAAA_normal: ratio >= 7.0,
    passAAA_large: ratio >= 4.5,
  }

  results.push(result)

  // Visual output
  const status = result.passAA_normal ? '✅' : result.passAA_large ? '⚠️ ' : '❌'
  console.log(`\n${status} ${context}`)
  console.log(`   Foreground: ${result.fg}`)
  console.log(`   Background: ${result.bg}`)
  console.log(`   Contrast Ratio: ${result.ratio}:1`)
  console.log(`   AA Normal: ${result.passAA_normal ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   AA Large:  ${result.passAA_large ? '✅ PASS' : '❌ FAIL'}`)
})

console.log('\n' + '='.repeat(80))

// Summary
const totalTests = results.length
const passedNormal = results.filter(r => r.passAA_normal).length
const passedLarge = results.filter(r => r.passAA_large).length

console.log('\n📊 Summary:')
console.log(`   Total combinations tested: ${totalTests}`)
console.log(`   AA Normal text (4.5:1): ${passedNormal}/${totalTests} ✅`)
console.log(`   AA Large text (3:1): ${passedLarge}/${totalTests} ✅`)

if (passedNormal === totalTests) {
  console.log('\n🎉 All combinations pass WCAG AA for normal text!')
} else if (passedLarge === totalTests) {
  console.log('\n⚠️  All combinations pass WCAG AA for large text only.')
  console.log('   Use large text (>= 18pt) for failing combinations.')
} else {
  console.log('\n❌ Some combinations fail WCAG AA standards.')
  console.log('   Review and adjust color usage.')
}

console.log('\n' + '='.repeat(80) + '\n')
