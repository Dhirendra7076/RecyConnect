import PublicTopBar from '../components/landing/PublicTopBar'
import Hero from '../components/landing/Hero'
import HowItWorks from '../components/landing/HowItWorks'
import RoleCards from '../components/landing/RoleCards'
import MaterialsShowcase from '../components/landing/MaterialsShowcase'
import ImpactTeaser from '../components/landing/ImpactTeaser'
import CTA from '../components/landing/CTA'
import Footer from '../components/layout/Footer'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicTopBar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <RoleCards />
        <MaterialsShowcase />
        <ImpactTeaser />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}