import { NextResponse } from 'next/server'

export function handleApiError(error: unknown) {
  console.error(error)
  const message = error instanceof Error ? error.message : 'An unknown error occurred'
  return NextResponse.json({ error: message }, { status: 500 })
}