/**
 * Quick test script to verify translation from Stricture to eslint-plugin-boundaries
 */

const { translateConfig } = require('./packages/core/dist/index.cjs')
const { hexagonalPreset } = require('./packages/hexagonal/dist/index.cjs')

console.log('🧪 Testing Stricture → boundaries translation\n')

// Create a Stricture config with hexagonal preset
const strictureConfig = {
  preset: hexagonalPreset.id,
  boundaries: hexagonalPreset.boundaries,
  rules: hexagonalPreset.rules
}

console.log('📋 Stricture Config:')
console.log(`  - Boundaries: ${strictureConfig.boundaries.length}`)
console.log(`  - Rules: ${strictureConfig.rules.length}\n`)

// Translate to boundaries format
const { config, context } = translateConfig(strictureConfig, {
  denyByDefault: true,
  includeExternal: true
})

console.log('🔄 Translation Result:')
console.log(`  - Elements: ${config.settings['boundaries/elements'].length}`)
console.log(`  - Element Types Rules: ${config.rules['boundaries/element-types'][1].rules.length}`)
console.log(`  - External Rules: ${config.rules['boundaries/external'] ? config.rules['boundaries/external'][1].rules.length : 0}`)
console.log(`  - Deny-by-default: ${context.denyByDefault}`)
console.log(`  - Warnings: ${context.warnings.length}`)
console.log(`  - Limitations: ${context.limitations.length}\n`)

if (context.warnings.length > 0) {
  console.log('⚠️  Warnings:')
  context.warnings.forEach(w => console.log(`   - ${w}`))
  console.log('')
}

if (context.limitations.length > 0) {
  console.log('ℹ️  Limitations:')
  context.limitations.forEach(l => console.log(`   - ${l}`))
  console.log('')
}

console.log('✅ Translation completed successfully!')
console.log('\n📊 Sample Element:')
console.log(JSON.stringify(config.settings['boundaries/elements'][0], null, 2))

console.log('\n📊 Sample Rule:')
console.log(JSON.stringify(config.rules['boundaries/element-types'][1].rules[0], null, 2))

console.log('\n🎉 Test passed!')
