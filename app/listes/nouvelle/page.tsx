'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewListPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('Veuillez entrer un nom pour la liste')
      return
    }

    setLoading(true)

    try {
      // Get user ID
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        router.push('/onboarding')
        return
      }

      const userEmail = `${userId}@temp.com`

      // Get actual user ID from database
      const userRes = await fetch(`/api/users?email=${userEmail}`)
      if (!userRes.ok) {
        router.push('/onboarding')
        return
      }

      const userData = await userRes.json()
      const actualUserId = userData.data?.id

      // Create list
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          isPublic,
          creatorId: actualUserId,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/listes/${data.data.id}`)
      } else {
        const error = await res.json()
        alert(error.error || 'Erreur lors de la création de la liste')
      }
    } catch (error) {
      console.error('Error creating list:', error)
      alert('Erreur lors de la création de la liste')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Créer une nouvelle liste
          </h1>
          <p className="mt-2 text-gray-600">
            Organisez vos événements préférés en listes
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nom de la liste *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ma sélection d'événements..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description (optionnel)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre liste..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 block">
                    Liste publique
                  </span>
                  <span className="text-xs text-gray-500">
                    Visible par tous les utilisateurs
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer la liste'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
