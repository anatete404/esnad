'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        fontFamily: 'Cairo, system-ui, sans-serif',
        background: '#f8faf7',
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'white',
          borderRadius: '24px',
          border: '1px solid rgba(0,0,0,0.05)',
          padding: '40px 24px',
          textAlign: 'center',
          boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto',
            fontSize: '36px',
          }}>
            ⚠️
          </div>

          <h1 style={{
            marginTop: '20px',
            fontSize: '22px',
            fontWeight: 800,
            color: '#111',
          }}>
            حدث خطأ حرج
          </h1>
          <p style={{
            marginTop: '10px',
            fontSize: '14px',
            color: 'rgba(0,0,0,0.6)',
            lineHeight: 1.7,
          }}>
            نعتذر عن الإزعاج. تم إبلاغ الفريق التقني وسيتم حل المشكلة في أقرب وقت.
          </p>

          <button
            onClick={reset}
            style={{
              marginTop: '24px',
              height: '44px',
              padding: '0 24px',
              borderRadius: '99px',
              background: '#0d7a3e',
              color: 'white',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            إعادة المحاولة
          </button>

          <div style={{
            marginTop: '24px',
            fontSize: '12px',
            color: 'rgba(0,0,0,0.4)',
          }}>
            منصة إسناد للتنمية الزراعية
          </div>
        </div>
      </body>
    </html>
  )
}
