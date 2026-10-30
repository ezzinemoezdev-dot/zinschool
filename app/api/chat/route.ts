import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Clé API Gemini manquante dans le .env.local" }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const { messages, context } = await req.json()

    const currentMessage = messages[messages.length - 1].content

    const systemPrompt = `Tu es ZIN, un assistant scolaire intelligent et amical pour les élèves de ZinSchool. 
Tu réponds toujours de manière claire, encourageante et pédagogue.
${context ? `L'élève est actuellement en train de consulter le cours suivant : "${context}". Base tes explications sur ce sujet si la question s'y rapporte.` : ''}
Réponds dans la langue de l'élève (arabe, français ou anglais).`

    // Utilisation de la nouvelle API Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash', // Le modèle le plus récent et stable
      contents: currentMessage,
      config: {
        systemInstruction: systemPrompt,
      },
    })

    return NextResponse.json({ message: response.text })

  } catch (error: any) {
    console.error("❌ ERREUR GEMINI COMPLETE :", error)
    return NextResponse.json({ error: error.message || 'Erreur inconnue' }, { status: 500 })
  }
}