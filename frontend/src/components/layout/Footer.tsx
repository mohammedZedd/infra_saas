export default function Footer() {
  return (
    <footer className="bg-gray-900 py-16 text-gray-400">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <p className="text-sm">CloudForge</p>
        <p className="text-sm">© {new Date().getFullYear()} CloudForge. All rights reserved.</p>
      </div>
    </footer>
  )
}
