'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { likeService } from '@/lib/firestore'
import { matchService } from '@/lib/firestore'
import { messageService } from '@/lib/firestore'
import { userService } from '@/lib/firestore'
import { authService } from '@/lib/auth'

interface Notification {
  id: string
  type: 'match' | 'message' | 'like'
  title: string
  description: string
  time: Date
  read: boolean
  userId?: string
  userName?: string
}

export default function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [logoutDropdownOpen, setLogoutDropdownOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    loadUser()
    loadNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadUser = async () => {
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) return

      const userData = await userService.getUserById(userId)
      setUser(userData)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('userId')
      if (!userId) return

      const loadedNotifications: Notification[] = []

      // Load received likes
      const receivedLikes = await likeService.getReceivedLikes(userId)
      for (const like of receivedLikes) {
        const fromUser = await userService.getUserById(like.fromUserId)
        loadedNotifications.push({
          id: like.id,
          type: 'like',
          title: 'Nouveau like',
          description: `${fromUser?.firstName || 'Quelqu\'un'} a aimé votre profil`,
          time: like.createdAt,
          read: false,
          userId: like.fromUserId,
          userName: fromUser?.firstName
        })
      }

      // Load matches
      const matches = await matchService.getUserMatches(userId)
      for (const match of matches) {
        const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1
        const otherUser = await userService.getUserById(otherUserId)
        loadedNotifications.push({
          id: match.id,
          type: 'match',
          title: 'Nouveau match !',
          description: `Vous avez matché avec ${otherUser?.firstName || 'quelqu\'un'}`,
          time: match.matchedAt,
          read: false,
          userId: otherUserId,
          userName: otherUser?.firstName
        })
      }

      // Load conversations with unread messages
      const conversations = await messageService.getUserConversations(userId)
      conversations.forEach(conv => {
        const unreadCount = conv.userId1 === userId ? conv.unreadCount1 : conv.unreadCount2
        if (unreadCount > 0) {
          loadedNotifications.push({
            id: conv.id,
            type: 'message',
            title: 'Nouveau message',
            description: conv.lastMessage || 'Nouveau message reçu',
            time: conv.lastMessageAt,
            read: false
          })
        }
      })

      // Sort by time (newest first)
      loadedNotifications.sort((a, b) => b.time.getTime() - a.time.getTime())

      setNotifications(loadedNotifications)
      setUnreadCount(loadedNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'À l\'instant'
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`
    return `Il y a ${Math.floor(diffInSeconds / 604800)} sem`
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'match':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        )
      case 'message':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )
      case 'like':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-1.3h-7.28z"/>
            <path d="M18 9H12"/>
          </svg>
        )
      default:
        return null
    }
  }

  const handleLogout = async () => {
    try {
      await authService.signOut()
      localStorage.removeItem('userId')
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }



  return (
    <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="app-header-container">
        <div className="logo">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span className="logo-text">FoiMatch</span>
        </div>
        
        <nav className={`app-nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {pathname === '/onboarding' ? (
            <span className="app-nav-link disabled">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Découvrir
            </span>
          ) : (
            <Link href="/discover" className="app-nav-link">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Découvrir
            </Link>
          )}
          {pathname === '/onboarding' ? (
            <span className="app-nav-link disabled">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Matchs
            </span>
          ) : (
            <Link href="/matches" className="app-nav-link">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Matchs
            </Link>
          )}
          {pathname === '/onboarding' ? (
            <span className="app-nav-link disabled">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-1.3h-7.28z"/>
                <path d="M18 9H12"/>
              </svg>
              Likes
            </span>
          ) : (
            <Link href="/likes" className="app-nav-link">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-1.3h-7.28z"/>
                <path d="M18 9H12"/>
              </svg>
              Likes
            </Link>
          )}
          {pathname === '/onboarding' ? (
            <span className="app-nav-link disabled">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Messages
            </span>
          ) : (
            <Link href="/messages" className="app-nav-link">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Messages
            </Link>
          )}
          {pathname === '/onboarding' ? (
            <span className="app-nav-link disabled">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Premium
            </span>
          ) : (
            <Link href="/premium" className="app-nav-link premium-link">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Premium
            </Link>
          )}
        </nav>
        
        <div className="app-header-actions">
          <button 
            className="notification-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <svg className="notification-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          
          <div className="profile-section">
            <Link href="/profile" className="profile-avatar">
              <div className="avatar-circle">
                {user?.mainPhoto ? (
                  <img src={user.mainPhoto} alt="Profile" className="avatar-image" />
                ) : (
                  <span>{user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
            </Link>
            
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="Se déconnecter"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
          
          <button 
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <nav className="mobile-bottom-nav">
          <div className="bottom-nav-left">
            {pathname === '/onboarding' ? (
              <span className="bottom-nav-item disabled">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span>Découvrir</span>
              </span>
            ) : (
              <Link href="/discover" className={`bottom-nav-item ${pathname === '/discover' ? 'active' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span>Découvrir</span>
              </Link>
            )}
            {pathname === '/onboarding' ? (
              <span className="bottom-nav-item disabled">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-1.3h-7.28z"/>
                  <path d="M18 9H12"/>
                </svg>
                <span>Likes</span>
              </span>
            ) : (
              <Link href="/likes" className={`bottom-nav-item ${pathname === '/likes' ? 'active' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-1.3h-7.28z"/>
                  <path d="M18 9H12"/>
                </svg>
                <span>Likes</span>
              </Link>
            )}
          </div>
          
          <div className="bottom-nav-center">
            {pathname === '/onboarding' ? (
              <span className="bottom-nav-item-center disabled">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>Matchs</span>
              </span>
            ) : (
              <Link href="/matches" className={`bottom-nav-item-center ${pathname === '/matches' ? 'active' : ''}`}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>Matchs</span>
              </Link>
            )}
          </div>
          
          <div className="bottom-nav-right">
            {pathname === '/onboarding' ? (
              <span className="bottom-nav-item disabled">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Messages</span>
              </span>
            ) : (
              <Link href="/messages" className={`bottom-nav-item ${pathname === '/messages' ? 'active' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Messages</span>
              </Link>
            )}
            {pathname === '/onboarding' ? (
              <span className="bottom-nav-item disabled">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span>Premium</span>
              </span>
            ) : (
              <Link href="/premium" className={`bottom-nav-item ${pathname === '/premium' ? 'active' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span>Premium</span>
              </Link>
            )}
          </div>
        </nav>
      </div>

      {notificationsOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-read-btn" onClick={markAllAsRead}>Tout marquer comme lu</button>
            )}
          </div>
          <div className="notifications-list">
            {loading ? (
              <div className="notifications-loading">
                <div className="loading-spinner-small"></div>
                <p>Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notifications-empty">
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <div className="notification-icon-wrapper">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-text">
                      <p className="notification-title">{notification.title}</p>
                      <p className="notification-desc">{notification.description}</p>
                    </div>
                  </div>
                  <span className="notification-time">{formatTime(notification.time)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </header>
  )
}