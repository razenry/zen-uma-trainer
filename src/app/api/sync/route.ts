import { NextResponse } from 'next/server'
import { APISyncService } from '@/services/api-sync.service'

export async function GET() {
  try {
    const syncRes = await APISyncService.runFullSync()
    if (syncRes.success) {
      return NextResponse.json({
        success: true,
        message: "Database sync and seed completed successfully.",
        results: syncRes.results
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Database sync failed.",
        error: syncRes.error
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "An error occurred during sync.",
      error: error.message
    }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
