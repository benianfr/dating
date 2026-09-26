import { useEffect, useRef, useState } from 'react'

export function useScrollAnimation() {
  const [scrolled, setScrolled] = useState(false)
  const [lastScroll, setLastScroll] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY
      
      if (currentScroll > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
      
      setLastScroll(currentScroll)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { scrolled, lastScroll }
}

export function useIntersectionObserver() {
  const observerRef = useRef<IntersectionObserver>()

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement
            const delay = element.dataset.animationDelay || '0'
            
            setTimeout(() => {
              element.classList.add('visible')
              element.classList.remove('hidden')
            }, parseInt(delay))
            
            observerRef.current?.unobserve(element)
          }
        })
      },
      {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
      }
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  const observeElement = (element: HTMLElement) => {
    if (observerRef.current) {
      element.classList.add('hidden')
      observerRef.current.observe(element)
    }
  }

  return { observeElement }
}

export function useRippleEffect() {
  const createRipple = (element: HTMLElement, event: React.MouseEvent) => {
    const ripple = document.createElement('div')
    const rect = element.getBoundingClientRect()
    
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    ripple.style.cssText = `
      position: absolute;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      pointer-events: none;
      width: 100px;
      height: 100px;
      left: ${x - 50}px;
      top: ${y - 50}px;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
    `
    
    element.style.position = 'relative'
    element.style.overflow = 'hidden'
    element.appendChild(ripple)
    
    setTimeout(() => ripple.remove(), 600)
  }

  return { createRipple }
}

export function useMouseTracking() {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const heroImage = document.querySelector('.hero-image-content')
      if (heroImage) {
        const rect = heroImage.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        setMouseX((e.clientX - centerX) / 30)
        setMouseY((e.clientY - centerY) / 30)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return { mouseX, mouseY }
}