'use client'
import { useTheme } from './ThemeProvider'

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
