import Header from '@/components/Header'
import Hero from '@/components/Hero'
import VideoSection from '@/components/VideoSection'
import WhySection from '@/components/WhySection'
import SecuritySection from '@/components/SecuritySection'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import PricingSection from '@/components/PricingSection'
import Testimonials from '@/components/Testimonials'
import FinalVerse from '@/components/FinalVerse'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <VideoSection />
      <WhySection />
      <SecuritySection />
      <Features />
      <HowItWorks />
      <PricingSection />
      <Testimonials />
      <FinalVerse />
      <Footer />
    </main>
  )
}