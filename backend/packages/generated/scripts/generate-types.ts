#!/usr/bin/env tsx

import { execSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "yaml"

const __dirname = dirname(fileURLToPath(import.meta.url))

const CONFIG = {
  openApiPath: resolve(__dirname, "../../../../specs/tsp-output/@typespec/openapi3/openapi.yaml"),
  outputDir: resolve(__dirname, "../src"),
  tempFile: "api-types-temp.ts",
}

async function generateTypesFromOpenAPI(): Promise<void> {
  const { openApiPath, outputDir, tempFile } = CONFIG
  const tempOutput = join(outputDir, tempFile)

  if (!existsSync(openApiPath)) {
    console.error(`OpenAPI file not found at: ${openApiPath}`)
    console.error('Please run "pnpm generate:spec" first')
    process.exit(1)
  }

  mkdirSync(outputDir, { recursive: true })

  console.log("Generating types from OpenAPI specification...")
  console.log(`Input: ${openApiPath}`)
  console.log(`Output: ${outputDir}`)

  try {
    execSync(`npx openapi-typescript "${openApiPath}" -o "${tempOutput}"`, {
      stdio: "inherit",
      cwd: dirname(__dirname),
    })
  } catch (error) {
    console.error("Failed to generate types:", error)
    process.exit(1)
  }

  const baseTypes = readFileSync(tempOutput, "utf-8")

  const apiTypesContent = createApiTypesFile(baseTypes)
  writeFileSync(join(outputDir, "api-types.ts"), apiTypesContent)

  await generateZodSchemas(openApiPath, outputDir)

  try {
    const fs = await import("node:fs/promises")
    await fs.unlink(tempOutput)
  } catch {
    // Ignore cleanup errors
  }

  createIndexFile(outputDir)

  console.log("Type generation complete!")
  console.log(`Generated files in: ${outputDir}`)
  console.log("  - api-types.ts")
  console.log("  - schema.ts")
  console.log("  - index.ts")
}

function createApiTypesFile(baseTypes: string): string {
  return `// Generated from TypeSpec/OpenAPI using openapi-typescript
// DO NOT EDIT MANUALLY
// Last generated: ${new Date().toISOString()}

${baseTypes}
`
}

async function generateZodSchemas(openApiPath: string, outputDir: string): Promise<void> {
  const openApiContent = readFileSync(openApiPath, "utf-8")
  // biome-ignore lint/suspicious/noExplicitAny: OpenAPI spec parsed from YAML has dynamic structure
  const openApi = parse(openApiContent) as any
  const schemas = openApi.components?.schemas ?? {}

  let content = `// Generated Zod schemas from OpenAPI
// DO NOT EDIT MANUALLY
// Last generated: ${new Date().toISOString()}

import { z } from "zod"

`

  for (const [key, schema] of Object.entries(schemas)) {
    const name = key.split(".").pop() ?? key
    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI schema has dynamic structure
    const s = schema as any

    if (s.type === "string" && s.enum) {
      const enumValues = s.enum as string[]
      const description = s.description

      if (description) {
        content += `/** ${description} */\n`
      }

      const enumValuesFormatted = enumValues.map((v) => `"${v}"`).join(", ")
      content += `export const ${name}Schema = z.enum([${enumValuesFormatted}])\n`
      content += `export type ${name} = z.infer<typeof ${name}Schema>\n\n`
    }
  }

  writeFileSync(join(outputDir, "schema.ts"), content)
}

function createIndexFile(outputDir: string): void {
  const indexContent = `// Generated from TypeSpec/OpenAPI
// DO NOT EDIT MANUALLY
// Last generated: ${new Date().toISOString()}

export * from "./api-types.js"
export * from "./schema.js"
`

  writeFileSync(join(outputDir, "index.ts"), indexContent)
}

generateTypesFromOpenAPI().catch((error) => {
  console.error("Type generation failed:", error)
  process.exit(1)
})
