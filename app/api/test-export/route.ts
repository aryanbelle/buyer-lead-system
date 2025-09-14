import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const csvContent = `fullName,email,phone,city
John Doe,john@example.com,1234567890,Chandigarh
Jane Smith,jane@example.com,0987654321,Mohali`
    
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="test-export.csv"'
      }
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Test export failed" }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
