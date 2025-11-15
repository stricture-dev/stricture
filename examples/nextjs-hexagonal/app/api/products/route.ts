import { getProductsUseCase } from '@/app/di-container'

/**
 * API Route Handler - GET /api/products
 *
 * This is a "driving adapter" (primary/active) in hexagonal architecture:
 * - Entry point that receives HTTP requests
 * - Calls use cases from the application layer
 * - Transforms domain objects into HTTP responses
 * - Does NOT know about repositories or other infrastructure
 *
 * The adapter pattern:
 * 1. Receive external input (HTTP request)
 * 2. Call application use case
 * 3. Transform result to external format (JSON response)
 *
 * Benefits:
 * - Easy to test (mock the use case)
 * - Framework-independent business logic (use case)
 * - Clear separation of concerns
 */

/**
 * Handle GET requests to /api/products
 * Returns all products as JSON
 */
export async function GET() {
  try {
    // Call the use case - this is our only dependency
    const products = await getProductsUseCase.execute()

    // Transform domain objects to JSON response
    // Note: Product class instances will be serialized to plain objects
    return Response.json(products)
  } catch (error) {
    // Handle errors and return appropriate HTTP status
    if (error instanceof Error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      )
    }
    return Response.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
