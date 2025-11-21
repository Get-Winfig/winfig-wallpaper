import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  Squares2X2Icon,
  ViewfinderCircleIcon,
  XMarkIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

function App() {
  const [photos, setPhotos] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState(new Set())
  const [viewMode, setViewMode] = useState('gallery')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [downloadStatus, setDownloadStatus] = useState(null)
  const [shareStatus, setShareStatus] = useState(null)
  const [visibleThumbnails, setVisibleThumbnails] = useState(new Set())
  const fullscreenRef = useRef(null)
  const sidebarRef = useRef(null)
  const observer = useRef(null)

  // Mock data for development
  const mockPhotos = [
    {
      name: "001-1920x1080.png",
      src: "images/001-1920x1080.png",
      type: "png",
      resolution: "1920X1080",
      url: "https://picsum.photos/1920/1080?random=1"
    },
    {
      name: "002-1920x1080.png",
      src: "images/002-1920x1080.png",
      type: "png",
      resolution: "1920X1080",
      url: "https://picsum.photos/1920/1080?random=2"
    },
    {
      name: "003-1920x1080.png",
      src: "images/003-1920x1080.png",
      type: "png",
      resolution: "1920X1080",
      url: "https://picsum.photos/1920/1080?random=3"
    },
    {
      name: "004-1920x1080.png",
      src: "images/004-1920x1080.png",
      type: "png",
      resolution: "1920X1080",
      url: "https://picsum.photos/1920/1080?random=4"
    },
    {
      name: "005-1920x1080.png",
      src: "images/005-1920x1080.png",
      type: "png",
      resolution: "1920X1080",
      url: "https://picsum.photos/1920/1080?random=5"
    }
  ]

  // Intersection Observer for lazy loading thumbnails
  const createObserver = useCallback(() => {
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.dataset.index)
          if (entry.isIntersecting) {
            setVisibleThumbnails(prev => new Set(prev.add(index)))
          }
        })
      },
      {
        root: sidebarRef.current,
        rootMargin: '100px 0px',
        threshold: 0.1
      }
    )
  }, [])

  useEffect(() => {
    createObserver()
    return () => {
      if (observer.current) observer.current.disconnect()
    }
  }, [createObserver])

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const response = await fetch('/photos.json')
        if (response.ok) {
          const data = await response.json()
          setPhotos(data.photos || [])
        } else {
          setPhotos(mockPhotos)
        }
      } catch (error) {
        console.warn('Could not load photos.json, using mock data')
        setPhotos(mockPhotos)
      }
      setLoading(false)
    }

    loadPhotos()
  }, [])

  // Preload adjacent images
  useEffect(() => {
    if (photos.length === 0) return

    const preloadImages = () => {
      const indices = [
        selectedPhoto - 1 >= 0 ? selectedPhoto - 1 : photos.length - 1,
        selectedPhoto,
        selectedPhoto + 1 < photos.length ? selectedPhoto + 1 : 0
      ]

      indices.forEach(index => {
        if (photos[index]) {
          const img = new Image()
          img.src = photos[index].url
        }
      })
    }

    preloadImages()
  }, [selectedPhoto, photos])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Escape') setIsFullscreen(false)
      if (e.key === ' ') {
        e.preventDefault()
        toggleFavorite()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedPhoto, photos.length])

  const handlePrevious = () => {
    setSelectedPhoto(prev => prev > 0 ? prev - 1 : photos.length - 1)
  }

  const handleNext = () => {
    setSelectedPhoto(prev => prev < photos.length - 1 ? prev + 1 : 0)
  }

  const handleDownload = async () => {
    if (!photos[selectedPhoto]) return

    setDownloadStatus('downloading')

    try {
      const response = await fetch(photos[selectedPhoto].url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = photos[selectedPhoto].name
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(url)

      setDownloadStatus('success')
      setTimeout(() => setDownloadStatus(null), 2000)
    } catch (error) {
      console.error('Download failed:', error)
      setDownloadStatus('error')
      setTimeout(() => setDownloadStatus(null), 2000)
    }
  }

  const toggleFavorite = () => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(selectedPhoto)) {
      newFavorites.delete(selectedPhoto)
    } else {
      newFavorites.add(selectedPhoto)
    }
    setFavorites(newFavorites)
  }

  const shareImage = async () => {
    if (!photos[selectedPhoto]) return

    setShareStatus('sharing')

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Winfig Wallpaper',
          text: `Check out this wallpaper: ${photos[selectedPhoto].name}`,
          url: photos[selectedPhoto].url,
        })
        setShareStatus('success')
      } else {
        await navigator.clipboard.writeText(photos[selectedPhoto].url)
        setShareStatus('success')
      }
      setTimeout(() => setShareStatus(null), 2000)
    } catch (err) {
      console.error('Share failed:', err)
      setShareStatus('error')
      setTimeout(() => setShareStatus(null), 2000)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Loading wallpapers...</div>
        </div>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <div className="text-white text-xl font-medium">No wallpapers found</div>
        </div>
      </div>
    )
  }

  const currentPhoto = photos[selectedPhoto]

  if (isFullscreen && currentPhoto) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" ref={fullscreenRef}>
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 z-60 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-200"
        >
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>
        <img
          src={currentPhoto.url}
          alt={currentPhoto.name}
          className="max-w-full max-h-full object-contain"
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <button
            onClick={handlePrevious}
            className="p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-200"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-200"
          >
            <ChevronRightIcon className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden flex flex-col">
      {/* Header - Fixed Height */}
      <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0">
        <div className="flex items-center justify-between h-10 sm:h-12">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm sm:text-lg lg:text-xl font-bold tracking-wide bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent truncate">
              <span className="hidden sm:inline">WINFIG WALLPAPERS</span>
              <span className="sm:hidden">WINFIG</span>
            </h1>
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
              <span>{photos.length}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors duration-200"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Flex-grow to fill remaining space */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${showSidebar && 'md:w-60 lg:w-64'}
          ${!showSidebar && 'md:w-0'}
          fixed md:relative left-0 top-0 h-full w-72
          transition-all duration-300 ease-in-out
          bg-gray-800/95 md:bg-gray-800/60 backdrop-blur-sm
          border-r border-gray-700/50
          z-50 md:z-auto
          ${showSidebar ? '' : 'md:hidden'}
          overflow-hidden flex-shrink-0
        `}>
          <div className="h-full flex flex-col overflow-hidden">
            {/* Mobile close button */}
            <div className="md:hidden flex justify-between items-center p-3 border-b border-gray-700/50 flex-shrink-0">
              <span className="text-xs text-gray-400">{photos.length} images</span>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors duration-200"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnails - Scrollable */}
            <div ref={sidebarRef} className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-2 space-y-2">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    data-index={index}
                    ref={(el) => {
                      if (el && observer.current) {
                        observer.current.observe(el)
                      }
                    }}
                    className={`relative group cursor-pointer transition-all duration-200 ${
                      index === selectedPhoto
                        ? 'ring-2 ring-cyan-400 rounded-lg scale-[1.02]'
                        : 'hover:ring-1 hover:ring-gray-500/50 rounded-lg hover:scale-[1.01]'
                    }`}
                    onClick={() => {
                      setSelectedPhoto(index)
                      setShowSidebar(false) // Close sidebar on mobile
                    }}
                  >
                    <div className="aspect-video bg-gray-700/50 rounded-lg overflow-hidden">
                      {visibleThumbnails.has(index) ? (
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700/50 animate-pulse flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-gray-500/50 border-t-cyan-400 rounded-full animate-spin" />
                        </div>
                      )}
                      {index === selectedPhoto && (
                        <div className="absolute inset-0 bg-cyan-400/10 rounded-lg" />
                      )}
                      {favorites.has(index) && (
                        <HeartSolidIcon className="absolute top-1 right-1 w-3 h-3 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Image Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Image Display - Takes remaining space */}
          <div className="flex-1 relative bg-gradient-to-br from-gray-850 to-gray-900 flex items-center justify-center overflow-hidden">
            {/* Navigation Arrows */}
            <button
              onClick={handlePrevious}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all duration-200 z-10 backdrop-blur-sm border border-white/10"
              disabled={photos.length <= 1}
            >
              <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all duration-200 z-10 backdrop-blur-sm border border-white/10"
              disabled={photos.length <= 1}
            >
              <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-1 sm:top-2 right-1 sm:right-2 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all duration-200 z-10 backdrop-blur-sm border border-white/10"
            >
              <EyeIcon className="w-4 h-4" />
            </button>

            {/* Main Image - Constrained to container */}
            <div className="w-full h-full flex items-center justify-center p-1 sm:p-2">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>

          {/* Bottom Controls - Fixed Height */}
          <div className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50 p-2 sm:p-3 flex-shrink-0">
            <div className="flex flex-col space-y-2">
              {/* Title Row */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-medium text-white truncate flex-1 mr-2">{currentPhoto.name}</h3>
                <button
                  onClick={toggleFavorite}
                  className={`p-1 rounded transition-colors duration-200 flex-shrink-0 ${
                    favorites.has(selectedPhoto) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  {favorites.has(selectedPhoto) ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                </button>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between gap-2">
                {/* Info */}
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <span>{selectedPhoto + 1}/{photos.length}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{currentPhoto.resolution}</span>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={shareImage}
                    disabled={shareStatus === 'sharing'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-white text-xs font-medium rounded-md transition-all duration-200 disabled:opacity-50"
                  >
                    {shareStatus === 'sharing' ? (
                      <div className="w-3 h-3 border border-gray-300 border-t-white rounded-full animate-spin" />
                    ) : shareStatus === 'success' ? (
                      <CheckIcon className="w-3 h-3 text-green-400" />
                    ) : (
                      <ShareIcon className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">
                      {shareStatus === 'success' ? 'Copied' : 'Share'}
                    </span>
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={downloadStatus === 'downloading'}
                    className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-medium rounded-md transition-all duration-200 disabled:opacity-50"
                  >
                    {downloadStatus === 'downloading' ? (
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    ) : downloadStatus === 'success' ? (
                      <CheckIcon className="w-3 h-3 text-green-400" />
                    ) : (
                      <ArrowDownTrayIcon className="w-3 h-3" />
                    )}
                    <span>
                      {downloadStatus === 'downloading' ? 'Downloading...' :
                       downloadStatus === 'success' ? 'Downloaded!' : 'Download'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
