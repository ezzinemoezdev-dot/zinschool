'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'

export default function NotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription)
          setIsLoading(false)
        })
      })
    } else {
      setIsLoading(false)
    }
  }, [])

  const subscribe = async () => {
    if (!('serviceWorker' in navigator)) return alert("Les notifications ne sont pas supportées sur ce navigateur.")

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert("Vous avez refusé les notifications.")
        return
      }

      const registration = await navigator.serviceWorker.ready
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      })

      setIsSubscribed(true)
    } catch (error) {
      console.error('Erreur lors de l\'abonnement:', error)
      alert("Impossible de s'abonner aux notifications.")
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  if (isLoading) return null

  return (
    <button
      onClick={subscribe}
      disabled={isSubscribed}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
        isSubscribed 
          ? 'bg-green-100 text-green-700 cursor-default' 
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      }`}
    >
      {isSubscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      {isSubscribed ? 'Notifications activées' : 'Activer les notifications'}
    </button>
  )
}