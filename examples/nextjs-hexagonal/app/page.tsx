import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Next.js Hexagonal Architecture
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#666' }}>
          Clean Architecture with <strong>Stricture</strong> enforcement
        </p>
      </header>

      <section style={{ background: 'white', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid #0070f3', marginBottom: '3rem' }}>
        <p>
          This example demonstrates how to build a Next.js application using{' '}
          <strong>Hexagonal Architecture</strong> (Ports & Adapters pattern),
          with architectural boundaries automatically enforced by{' '}
          <strong>Stricture</strong>.
        </p>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Explore the Example</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <Link href="/products" style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '2px solid #e0e0e0', textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#0070f3' }}>Product Catalog</h3>
            <p style={{ color: '#666' }}>Browse products using Next.js Server Components</p>
          </Link>

          <a href="/api/products" target="_blank" rel="noopener noreferrer" style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '2px solid #e0e0e0', textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#0070f3' }}>REST API</h3>
            <p style={{ color: '#666' }}>Explore the JSON API endpoints</p>
          </a>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '2rem 0', color: '#666', borderTop: '1px solid #e0e0e0', marginTop: '3rem' }}>
        <p>Built with Next.js 14, TypeScript, and Stricture</p>
      </footer>
    </div>
  )
}
