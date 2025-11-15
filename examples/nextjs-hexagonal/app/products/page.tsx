import Link from 'next/link'
import { getProductsUseCase } from '@/app/di-container'

export const metadata = {
  title: 'Products | Hexagonal Architecture Example',
  description: 'Browse our product catalog',
}

export default async function ProductsPage() {
  const products = await getProductsUseCase.execute()

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Product Catalog</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Demonstrating Hexagonal Architecture with Next.js 14
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {products.map((product) => (
          <Link
            href={`/products/${product.id}`}
            key={product.id}
            style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{product.name}</h2>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', background: product.inStock ? '#d4edda' : '#f8d7da', color: product.inStock ? '#155724' : '#721c24' }}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <p style={{ color: '#666', lineHeight: 1.6, flexGrow: 1 }}>
              {product.getShortDescription(100)}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0070f3' }}>{product.getFormattedPrice()}</span>
              <span style={{ color: '#0070f3', fontWeight: 500 }}>View details →</span>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ background: '#f5f5f5', padding: '2rem', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>API Endpoints</h2>
        <p>This example also provides REST API endpoints:</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ margin: '0.5rem 0' }}>
            <Link href="/api/products" target="_blank">GET /api/products</Link> - List all products
          </li>
          <li style={{ margin: '0.5rem 0' }}>
            <Link href="/api/products/1" target="_blank">GET /api/products/:id</Link> - Get a single product
          </li>
        </ul>
      </div>
    </div>
  )
}
