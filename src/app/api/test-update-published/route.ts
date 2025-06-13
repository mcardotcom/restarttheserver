import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()

    // Update all articles that are marked as published but might be missing other fields
    const { data, error } = await supabase
      .from('headlines')
      .update({ 
        published: true,
        draft: false,
        moderation_status: 'approved',
        moderation_notes: 'Updated by admin'
      })
      .eq('is_published', true)
      .select()

    if (error) {
      console.error('Error updating articles:', error)
      return NextResponse.json(
        { error: 'Failed to update articles' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Articles updated successfully',
      count: data.length,
      articles: data
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to update articles' },
      { status: 500 }
    )
  }
} 