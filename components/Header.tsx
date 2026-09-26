'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <div className="logo-icon"></div>
          <span className="logo-text">Foi & Cœur</span>
        </div>
        
        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link href="/" className="nav-link active">Accueil</Link>
          <Link href="/register" className="nav-link">Comment s'inscrire ?</Link>
          <Link href="/#pricing" className="nav-link">Tarifs</Link>
          <Link href="/#testimonials" className="nav-link">Témoignages</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
        </nav>
        
        <div className="header-actions">
          <Link href="/login" className="btn-login">Se connecter</Link>
          <button 
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  )
}