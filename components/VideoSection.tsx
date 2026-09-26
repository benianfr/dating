'use client'

import { useState, useEffect } from 'react'

export default function VideoSection() {
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [modalOpen])

  return (
    <section className="video-section">
      <div className="video-container">
        <div className="video-content">
          <button className="video-discover-btn">
            <div className="play-icon"></div>
            <span>Découvrez Foi & Cœur</span>
          </button>
          
          <h2 className="video-title">Une plateforme pensée pour toi</h2>
          <p className="video-subtitle">
            2 minutes pour comprendre comment Foi & Cœur va t'aider à trouver ta moitié.
          </p>
          
          <div className="video-wrapper">
            <div className="video-browser">
              <div className="browser-header">
                <div className="browser-controls">
                  <span className="control-dot red"></span>
                  <span className="control-dot yellow"></span>
                  <span className="control-dot green"></span>
                </div>
                <div className="browser-url">
                  <div className="lock-icon"></div>
                  <span>foi-coeur.com</span>
                </div>
              </div>
              <div className="video-content-area">
                <div className="video-placeholder">
                  <div className="video-pattern"></div>
                  <h3 className="video-text">Rencontre ta moitié</h3>
                  <div 
                    className="video-play-btn"
                    onClick={() => setModalOpen(true)}
                  >
                    <div className="play-btn-icon"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div 
          className="video-modal" 
          style={{ opacity: 1 }}
          onClick={() => setModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            <div className="video-container-modal">
              <div className="video-placeholder-modal">
                <div className="video-pattern-modal"></div>
                <h3 className="video-text-modal">Vidéo de présentation</h3>
                <p className="video-subtitle-modal">Motion design en cours de chargement...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
