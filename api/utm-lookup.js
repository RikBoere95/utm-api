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
    console.log(`🔍 Looking up UTM: ${utm}`)

    // Get ALL fields from the database to see what we have
    const { data, error } = await supabase
      .from('contacts')
      .select('*')  // Get everything
      .eq('utm', utm)
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'UTM not found' })
      }
      throw error
    }

    console.log('🔍 Raw database data:', data)

    // 🔍 DEBUG: Return the raw data first to see what we have
    const debugResponse = {
      message: "DEBUG: Raw database record",
      utm_searched: utm,
      raw_data: data,
      field_check: {
        utm: data.utm || 'MISSING',
        firstname: data.firstname || 'MISSING',
        companyname: data.companyname || 'MISSING',
        companybenefits: data.companybenefits ? 'PRESENT' : 'MISSING',
        obstacle1: data.obstacle1 || 'MISSING',
        solution1: data.solution1 || 'MISSING',
        flowtitle1: data.flowtitle1 || 'MISSING',
        flow1: data.flow1 || 'MISSING'
      }
    }

    // Also create the formatted response
    const formattedResponse = {
      UTM: data.utm,
      FirstName: data.firstname,
      Company_Name: data.companyname,
      Company_Benefits: data.companybenefits,
      Obstacle_1: data.obstacle1,
      Obstacle_2: data.obstacle2,
      Obstacle_3: data.obstacle3,
      Solution_1: data.solution1,
      Solution_2: data.solution2,
      Solution_3: data.solution3,
      Flow_Title_1: data.flowtitle1,
      Flow_1: data.flow1,
      Flow_Title_2: data.flowtitle2,
      Flow_2: data.flow2,
      Flow_Title_3: data.flowtitle3,
      Flow_3: data.flow3,
      UTM_Full: data.utmfull,
      Profile_URL: data.profileurl,
      LinkedIn_URL: data.linkedinurl
    }

    // Return both for debugging
    return res.status(200).json({
      debug: debugResponse,
      formatted: formattedResponse
    })

  } catch (error) {
    console.error('💥 Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}
