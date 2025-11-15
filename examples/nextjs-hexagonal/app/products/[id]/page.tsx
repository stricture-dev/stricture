import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductByIdUseCase } from '@/app/di-container'

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const product = await getProductByIdUseCase.execute(params.id)
    return {
      title: `${product.name} | Hexagonal Architecture Example`,
      description: product.description,
    }
  } catch {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found',
    }
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  let product

  try {
    product = await getProductByIdUseCase.execute(params.id)
  } catch (error) {
    notFound()
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <Link href="/products" style={{ color: '#0070f3', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem', fontWeight: 500 }}>
        ← Back to products
      </Link>

      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '2px solid #e0e0e0' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{product.name}</h1>
          <span style={{ padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', background: product.inStock ? '#d4edda' : '#f8d7da', color: product.inStock ? '#155724' : '#721c24' }}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0070f3' }}>{product.getFormattedPrice()}</span>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Description</h2>
          <p style={{ lineHeight: 1.8, color: '#333' }}>{product.description}</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Availability</h2>
          <p>
            {product.isAvailable() ? (
              <span style={{ color: '#155724', fontWeight: 500 }}>
                ✓ This product is currently available for purchase
              </span>
            ) : (
              <span style={{ color: '#721c24', fontWeight: 500 }}>
                ✗ This product is currently unavailable
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
