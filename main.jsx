import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

// 전역 오류 핸들러
window.addEventListener('error', (event) => {
  console.error('전역 오류:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('처리되지 않은 Promise 거부:', event.reason)
})

// 성능 모니터링
if (typeof window !== 'undefined' && 'performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0]
      if (perfData) {
        console.log('페이지 로드 시간:', Math.round(perfData.loadEventEnd - perfData.loadEventStart), 'ms')
      }
    }, 0)
  })
}

// 서비스 워커 등록 (PWA 기능)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker 등록 성공:', registration.scope)
      })
      .catch((error) => {
        console.log('ServiceWorker 등록 실패:', error)
      })
  })
}

// React 18의 Strict Mode와 함께 앱 렌더링
const root = ReactDOM.createRoot(document.getElementById('root'))

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (error) {
  console.error('앱 렌더링 오류:', error)
  
  // 오류 발생 시 폴백 UI 렌더링
  root.render(
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌊</div>
      <h1 style={{ marginBottom: '1rem', color: '#030213' }}>블루이코노미 챌린지</h1>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        앱을 불러오는 중에 오류가 발생했습니다.
      </p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          background: '#030213',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        페이지 새로고침
      </button>
    </div>
  )
}

// 개발 환경에서 Hot Module Replacement 지원
if (import.meta.hot) {
  import.meta.hot.accept()
}