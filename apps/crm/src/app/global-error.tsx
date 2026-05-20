'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#000',
          color: '#fff'
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            padding: '2rem',
            border: '1px solid #ef4444',
            borderRadius: '0.5rem',
            backgroundColor: '#0a0a0a'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Critical Error
              </h1>
              <p style={{ color: '#9ca3af' }}>
                A critical error occurred. The application needs to reload.
              </p>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#1a1a1a',
              borderRadius: '0.375rem',
              marginBottom: '1.5rem'
            }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Error details:
              </p>
              <p style={{
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                color: '#9ca3af',
                wordBreak: 'break-all'
              }}>
                {error.message || 'Unknown critical error'}
              </p>
              {error.digest && (
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={reset}
                style={{
                  flex: 1,
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  flex: 1,
                  padding: '0.5rem 1rem',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #404040',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Reload app
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
