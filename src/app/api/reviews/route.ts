import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createServerClient()

  // 1. Vérification de l'authentification
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    )
  }

  try {
    const { providerId, rating, comment } = await req.json()

    // 2. Logique métier : Un prestataire ne peut pas se noter lui-même
    if (user.id === providerId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas noter votre propre profil' },
        { status: 400 }
      )
    }

    // 3. Insertion dans la base de données
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          provider_id: providerId,
          user_id: user.id,
          rating,
          comment,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(
      { message: 'Avis enregistré !', data },
      { status: 201 }
    )
  } catch (err) {
    console.error('Erreur API /api/reviews:', err)
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'avis" },
      { status: 500 }
    )
  }
}
