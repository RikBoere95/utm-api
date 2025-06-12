import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { utm } = req.query
  if (!utm) {
    return res.status(400).json({ error: 'UTM parameter is required' })
  }

  try {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        utm,
        first_name,
        company_name,
        company_benefits,
        obstacle_1,
        obstacle_2,
        obstacle_3,
        solution_1,
        solution_2,
        solution_3,
        flow_title_1,
        flow_1,
        flow_title_2,
        flow_2,
        flow_title_3,
        flow_3
      `)
      .eq('utm', utm)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'UTM not found' })
      }
      throw error
    }

    // Format for your frontend (keeping your current field names)
    const response = {
      UTM: data.utm,
      FirstName: data.first_name,
      Company_Name: data.company_name,
      Company_Benefits: data.company_benefits,
      Obstacle_1: data.obstacle_1,
      Obstacle_2: data.obstacle_2,
      Obstacle_3: data.obstacle_3,
      Solution_1: data.solution_1,
      Solution_2: data.solution_2,
      Solution_3: data.solution_3,
      Flow_Title_1: data.flow_title_1,
      Flow_1: data.flow_1,
      Flow_Title_2: data.flow_title_2,
      Flow_2: data.flow_2,
      Flow_Title_3: data.flow_title_3,
      Flow_3: data.flow_3
    }

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    
    return res.status(200).json(response)

  } catch (error) {
    console.error('Database error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
