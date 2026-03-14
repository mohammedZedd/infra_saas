import { useState, useEffect } from "react"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"
import useGitStore from "../../stores/useGitStore"
import type { GitConnection } from "../../stores/useGitStore"
import toast from "react-hot-toast"
import { ExternalLink } from "lucide-react"

const PROVIDERS = [
  "GitHub",
  "GitHub Enterprise Server",
  "GitLab",
  "GitLab Enterprise Edition",
  "Bitbucket Cloud",
  "Bitbucket Server",
  "Azure DevOps",
  "AWS CodeCommit",
]

interface Props {
  isOpen: boolean
  onClose: () => void
  connection: GitConnection
}

export default function GitEditModal({ isOpen, onClose, connection }: Props) {
  const updateConnection = useGitStore((s) => s.updateConnection)
  const setLoading = useGitStore((s) => s.setLoading)
  const isLoading = useGitStore((s) => s.isLoading)

  const [repoUrl, setRepoUrl] = useState(connection.repoUrl)
  const [provider, setProvider] = useState(connection.provider)
  const [repoName, setRepoName] = useState(connection.repoName)
  const [pat, setPat] = useState("")
  const [branch, setBranch] = useState(connection.branch)
  const [username, setUsername] = useState(connection.username)

  // Re-sync fields when connection changes or modal reopens
  useEffect(() => {
    if (isOpen) {
      setRepoUrl(connection.repoUrl)
      setProvider(connection.provider)
      setRepoName(connection.repoName)
      setPat("")
      setBranch(connection.branch)
      setUsername(connection.username)
    }
  }, [isOpen, connection])

  const isValid = repoUrl.trim() && provider && repoName.trim() && branch.trim()

  const handleSave = async () => {
    if (!isValid) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    updateConnection(connection.id, {
      provider,
      repoUrl: repoUrl.trim(),
      repoName: repoName.trim(),
      branch: branch.trim(),
      username: username.trim(),
    })
    setLoading(false)
    toast.success("Git credential updated successfully")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Git credential"
      subtitle="Update the connection details for your Git repository."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={!isValid || isLoading} isLoading={isLoading}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Repo URL */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Git repository URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repo.git"
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Provider */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Git provider <span className="text-red-500">*</span>
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Repo name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Repository name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="my-terraform-repo"
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Username */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Username / email
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username@example.com"
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* PAT */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Personal access token
          </label>
          <input
            type="password"
            value={pat}
            onChange={(e) => setPat(e.target.value)}
            placeholder="Leave blank to keep existing token"
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Your token is encrypted and stored securely.{" "}
            <a
              href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-indigo-600 hover:underline"
            >
              How to generate a token <ExternalLink size={10} />
            </a>
          </p>
        </div>

        {/* Branch */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Default branch <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
    </Modal>
  )
}

