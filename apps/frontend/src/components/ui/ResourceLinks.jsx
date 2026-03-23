import { Youtube, ExternalLink, BookOpen } from 'lucide-react'

function Link({ href, icon: Icon, label, color }) {
  if (!href) {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-700 cursor-not-allowed select-none" aria-disabled="true">
        <Icon size={14} />
        <span className="hidden sm:inline">{label}</span>
      </span>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-1 text-xs ${color} hover:opacity-100 opacity-70 transition-opacity duration-150`}
      aria-label={label}
    >
      <Icon size={14} />
      <span className="hidden sm:inline">{label}</span>
    </a>
  )
}

export default function ResourceLinks({ ytLink, leetcodeLink, articleLink }) {
  return (
    <div className="flex items-center gap-3">
      <Link href={ytLink} icon={Youtube} label="YT" color="text-red-400" />
      <Link href={leetcodeLink} icon={ExternalLink} label="LC" color="text-yellow-400" />
      <Link href={articleLink} icon={BookOpen} label="Article" color="text-blue-400" />
    </div>
  )
}
