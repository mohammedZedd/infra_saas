export type CloudProvider = "aws" | "gcp" | "azure"

export interface CloudProviderConfig {
  id: CloudProvider
  name: string
  icon: string
  color: string
  description: string
  available: boolean
}

export const CLOUD_PROVIDERS: CloudProviderConfig[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    icon: "🟠",
    color: "#FF9900",
    description: "The most comprehensive cloud platform",
    available: true,
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    icon: "🔵",
    color: "#4285F4",
    description: "Google's cloud computing services",
    available: false,
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    icon: "🔷",
    color: "#0078D4",
    description: "Microsoft's cloud platform",
    available: false,
  },
]