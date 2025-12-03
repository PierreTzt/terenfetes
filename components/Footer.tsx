import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-bg-1 border-t border-bg-2 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* 3 columns layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Column 1: À propos */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-2.5">À propos</h3>
            <p className="text-sm text-muted-700 leading-snug">
              Un agenda local clair et utile. Pour sortir facilement, chaque semaine.
            </p>
            <a
              href="mailto:contact@territoireenfete.fr"
              className="inline-flex items-center gap-2 mt-2.5 text-sm text-brand hover:underline focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded"
            >
              <Mail className="w-5 h-5 text-muted-400" />
              contact@territoireenfete.fr
            </a>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-2.5">Navigation</h3>
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                className="text-sm text-muted-700 hover:text-brand hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded"
              >
                Événements
              </Link>
              <Link
                href="/carte"
                className="text-sm text-muted-700 hover:text-brand hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded"
              >
                Carte
              </Link>
              <Link
                href="/organisateurs"
                className="text-sm text-muted-700 hover:text-brand hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded"
              >
                Organisateurs
              </Link>
              <Link
                href="/soumettre"
                className="text-sm text-muted-700 hover:text-brand hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded"
              >
                Soumettre un événement
              </Link>
            </nav>
          </div>

          {/* Column 3: Légal */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-2.5">Légal</h3>
            <nav className="flex flex-col gap-1">
              <Link
                href="/contact"
                className="text-sm text-muted-700 hover:text-brand hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded"
              >
                Contact
              </Link>
              <Link
                href="/mentions-legales"
                className="text-sm text-muted-700 hover:text-brand hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded"
              >
                Mentions légales
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-bg-2 text-center">
          <p className="text-sm text-muted-400">
            © {currentYear} Territoire en Fête. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
