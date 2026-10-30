import ZinChatbot from '@/components/ZinChatbot'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Tout le contenu des pages élèves s'affichera ici */}
      {children}
      
      {/* 🌟 ZIN apparaîtra uniquement sur les pages élèves */}
      <ZinChatbot lessonContext="Espace élève ZinSchool" />
    </>
  )
}