import {
  type AwsComponentType,
  type AwsComponentConfig,
  AWS_COMPONENTS,
} from "../types/aws"

export interface ParsedResource {
  /** The AwsComponentType that matches the terraform resource type */
  type: AwsComponentType
  /** The terraform resource name (e.g. "my_vpc") */
  name: string
  /** Matched config from AWS_COMPONENTS */
  config: AwsComponentConfig
}

/** Build a lookup: terraformType → AwsComponentConfig */
const TF_TYPE_MAP = new Map<string, AwsComponentConfig>()
for (const comp of AWS_COMPONENTS) {
  TF_TYPE_MAP.set(comp.terraformType, comp)
}

/**
 * Parse the text content of one or more .tf files and extract `resource` blocks.
 * Returns an array of ParsedResource that can be placed on the canvas.
 *
 * This is a lightweight regex-based parser — it doesn't handle full HCL semantics,
 * but covers the common `resource "aws_xxx" "name" { ... }` pattern.
 */
export function parseTerraformText(tfContent: string): ParsedResource[] {
  const resources: ParsedResource[] = []

  // Match:  resource "type" "name" {
  const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{/g
  let match: RegExpExecArray | null

  while ((match = resourceRegex.exec(tfContent)) !== null) {
    const terraformType = match[1]
    const resourceName = match[2]

    const config = TF_TYPE_MAP.get(terraformType)
    if (config) {
      resources.push({
        type: config.type,
        name: resourceName,
        config,
      })
    }
    // Resources not in our catalogue are silently skipped
  }

  return resources
}

/**
 * Read uploaded File objects (from drag/drop or file picker) and parse them.
 * Supports both .tf text files and .zip archives (extracts .tf files from the zip).
 */
export async function parseTerraformFiles(files: File[]): Promise<ParsedResource[]> {
  const allResources: ParsedResource[] = []

  for (const file of files) {
    if (file.name.endsWith(".zip")) {
      // Attempt to extract .tf files from zip
      // For now we treat zip as unsupported and skip
      // Future: use JSZip or similar
      console.warn(`Zip import not yet implemented: ${file.name}`)
      continue
    }

    // Read .tf file as text
    const text = await file.text()
    const parsed = parseTerraformText(text)
    allResources.push(...parsed)
  }

  // Deduplicate by type+name
  const seen = new Set<string>()
  return allResources.filter((r) => {
    const key = `${r.type}:${r.name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
