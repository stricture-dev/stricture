import { getProductByIdUseCase } from '@/app/di-container'

/**
 * API Route Handler - GET /api/products/:id
 *
 * This driving adapter handles requests for a single product.
 * It demonstrates:
 * - Extracting route parameters
 * - Calling use cases with parameters
 * - Handling different error scenarios (404 vs 500)
 */

/**
 * Handle GET requests to /api/products/:id
 * Returns a single product as JSON
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Extract the product ID from route parameters
    const { id } = params

    // Call the use case with the ID
    const product = await getProductByIdUseCase.execute(id)

    // Return the product as JSON
    return Response.json(product)
  } catch (error) {
    if (error instanceof Error) {
      // Distinguish between "not found" and other errors
      if (error.message.includes('not found')) {
        return Response.json(
          { error: error.message },
          { status: 404 }
        )
      }

      // Other business logic errors
      return Response.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Unknown errors
    return Response.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
