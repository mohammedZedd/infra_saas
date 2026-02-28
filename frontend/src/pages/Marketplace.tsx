import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Database, Download, Globe, Lock, Package, Server, Zap } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { SearchInput } from "../components/ui/SearchInput"
import { EmptyState } from "../components/ui/EmptyState"
import { cn } from "../utils/cn"

interface Template {
  id: string
  name: string
  description: string
  category: string
  icon: React.ElementType
  nodeCount: number
  downloads: number
  tags: string[]
}

const TEMPLATES: Template[] = [
  { id: "t1", name: "Production VPC", description: "Full VPC with public/private subnets, NAT gateway, and security groups.", category: "Networking", icon: Globe, nodeCount: 8, downloads: 1420, tags: ["vpc", "ec2", "networking"] },
  { id: "t2", name: "Serverless API", description: "Lambda + API Gateway + DynamoDB for a scalable REST API.", category: "Serverless", icon: Zap, nodeCount: 5, downloads: 983, tags: ["lambda", "api", "dynamodb"] },
  { id: "t3", name: "Static Website CDN", description: "S3 + CloudFront + ACM certificate for a globally distributed site.", category: "Web", icon: Globe, nodeCount: 4, downloads: 762, tags: ["s3", "cloudfront", "cdn"] },
  { id: "t4", name: "RDS PostgreSQL Cluster", description: "Multi-AZ RDS PostgreSQL with automated backups and parameter groups.", category: "Database", icon: Database, nodeCount: 6, downloads: 541, tags: ["rds", "postgres", "database"] },
  { id: "t5", name: "ECS Fargate Service", description: "ECS cluster with Fargate launch type and ALB in front.", category: "Containers", icon: Server, nodeCount: 9, downloads: 445, tags: ["ecs", "fargate", "containers"] },
  { id: "t6", name: "IAM Roles & Policies", description: "Opinionated IAM role set with least-privilege policies.", category: "Security", icon: Lock, nodeCount: 7, downloads: 310, tags: ["iam", "security", "roles"] },
]

const CATEGORIES = ["All", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))]

export default function Marketplace() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const navigate = useNavigate()

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = category === "All" || t.category === category
    const q = search.toLowerCase()
    const matchSearch =
      !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q))
    return matchCat && matchSearch
  })

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Template Marketplace</h1>
        <p className="mt-1 text-sm text-gray-500">Start from a battle-tested template and customize it to your needs.</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search templates..." className="sm:max-w-sm" />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
                category === cat ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No templates found"
          description="Try a different search term or category."
          action={{
            label: "Clear search",
            onClick: () => {
              setSearch("")
              setCategory("All")
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tmpl) => {
            const Icon = tmpl.icon
            return (
              <div key={tmpl.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{tmpl.name}</h3>
                    <Badge variant="info" size="sm">
                      {tmpl.category}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-gray-500">{tmpl.description}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tmpl.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Download size={12} />
                    {tmpl.downloads.toLocaleString()} uses
                  </span>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard`)}>
                    Use template
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}
