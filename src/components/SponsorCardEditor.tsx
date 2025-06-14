import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

interface SponsorCard {
  id?: string
  title: string
  description: string
  link: string
  partner: string
  image_url?: string | null
  active: boolean
}

export default function SponsorCardEditor() {
  const [sponsor, setSponsor] = useState<SponsorCard>({
    title: '',
    description: '',
    link: '',
    partner: '',
    active: true
  })
  const [sponsorCards, setSponsorCards] = useState<SponsorCard[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [supabase] = useState(() => createClient())

  const fetchSponsorCards = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsor_cards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching sponsor cards:', error)
        throw error
      }

      setSponsorCards(data || [])
    } catch (err) {
      console.error('Error in fetchSponsorCards:', err)
      setMessage({ type: 'error', text: 'Failed to fetch sponsor cards' })
    }
  }

  useEffect(() => {
    fetchSponsorCards()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Format the link URL
      let formattedLink = sponsor.link.trim()
      
      // Remove any protocol if present
      formattedLink = formattedLink.replace(/^(https?:\/\/)?(www\.)?/, '')
      
      // Add https:// if not present
      if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
        formattedLink = `https://${formattedLink}`
      }

      // Ensure we have a partner value
      const partner = sponsor.partner?.trim() || 'Ad'

      const sponsorData = {
        ...sponsor,
        link: formattedLink,
        partner
      }

      console.log('Submitting sponsor data:', sponsorData)

      const { error } = await supabase
        .from('sponsor_cards')
        .upsert([sponsorData], {
          onConflict: 'id'
        })

      if (error) {
        console.error('Error updating sponsor card:', error)
        throw error
      }

      setMessage({ type: 'success', text: 'Sponsor card updated successfully' })
      setSponsor({
        title: '',
        description: '',
        link: '',
        partner: '',
        active: true
      })
      await fetchSponsorCards()
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to update sponsor card'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (card: SponsorCard) => {
    setSponsor({
      id: card.id,
      title: card.title,
      description: card.description,
      link: card.link,
      partner: card.partner || 'Ad',
      image_url: card.image_url,
      active: card.active
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sponsor card?')) return

    try {
      const { error } = await supabase
        .from('sponsor_cards')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting sponsor card:', error)
        throw error
      }

      setMessage({ type: 'success', text: 'Sponsor card deleted successfully' })
      await fetchSponsorCards()
    } catch (err) {
      console.error('Error in handleDelete:', err)
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to delete sponsor card'
      })
    }
  }

  const handleToggleActive = async (card: SponsorCard) => {
    if (!card.id) {
      setMessage({ type: 'error', text: 'Cannot toggle card without ID' })
      return
    }

    try {
      const { error } = await supabase
        .from('sponsor_cards')
        .update({ active: !card.active })
        .eq('id', card.id)
        .select()

      if (error) {
        console.error('Error toggling sponsor card:', error)
        throw error
      }

      setMessage({ 
        type: 'success', 
        text: `Sponsor card ${!card.active ? 'activated' : 'deactivated'} successfully` 
      })
      await fetchSponsorCards()
    } catch (err) {
      console.error('Error in handleToggleActive:', err)
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to update sponsor card status'
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h2 className="text-xl font-semibold text-white mb-4">Sponsor Card Editor</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={sponsor.title}
              onChange={(e) => setSponsor({ ...sponsor, title: e.target.value })}
              className="w-full bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label htmlFor="partner" className="block text-sm font-medium text-gray-300 mb-1">
              Business Name
            </label>
            <input
              type="text"
              id="partner"
              value={sponsor.partner}
              onChange={(e) => setSponsor({ ...sponsor, partner: e.target.value })}
              className="w-full bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="Enter business name"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={sponsor.description}
              onChange={(e) => setSponsor({ ...sponsor, description: e.target.value })}
              className="w-full bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-300 mb-1">
              Link URL
            </label>
            <input
              type="text"
              id="link"
              value={sponsor.link}
              onChange={(e) => setSponsor({ ...sponsor, link: e.target.value })}
              className="w-full bg-zinc-800 text-white rounded px-3 py-2 border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="example.com"
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded ${
              message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : sponsor.id ? 'Update Sponsor Card' : 'Create Sponsor Card'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Existing Sponsor Cards</h2>
        {sponsorCards.length === 0 ? (
          <div className="text-zinc-400">No sponsor cards found</div>
        ) : (
          <div className="space-y-4">
            {sponsorCards.map((card) => (
              <div
                key={card.id}
                className="bg-zinc-900 rounded-lg p-4 border border-zinc-800"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-1">
                      {card.title}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-2">{card.description}</p>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <a 
                        href={card.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        {card.link}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(card)}
                      className={`flex items-center gap-1 transition-colors ${
                        card.active ? 'text-green-400 hover:text-green-300' : 'text-zinc-400 hover:text-zinc-300'
                      }`}
                      title={card.active ? 'Deactivate' : 'Activate'}
                    >
                      {card.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {card.active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleEdit(card)}
                      className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => card.id && handleDelete(card.id)}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 