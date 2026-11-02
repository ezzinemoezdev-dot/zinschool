// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

// On configure web-push avec nos clés
webpush.setVapidDetails(
  'mailto:ton-email@exemple.com', // Mets ton email (obligatoire pour la norme)
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { title, message, url } = await req.json()

    // 1. Récupérer tous les abonnements
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (error) throw error

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'Aucun abonné' })
    }

    // 2. Préparer le message
    const payload = JSON.stringify({
      title: title || 'ZinSchool',
      body: message || 'Nouveau contenu disponible !',
      url: url || '/student'
    })

    // 3. Envoyer à tous les abonnés
    const sendPromises = subscriptions.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      }
      return webpush.sendNotification(pushSubscription, payload).catch((err:any) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Si l'abonnement n'est plus valide, on le supprime de la BDD
          return supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
        console.error("Erreur envoi:", err)
      })
    })

    await Promise.all(sendPromises)

    return NextResponse.json({ success: true, count: subscriptions.length })
  } catch (error: any) {
    console.error("Erreur send push:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}