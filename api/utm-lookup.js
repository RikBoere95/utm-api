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

    // Query Supabase using 'utm' column (matches your database)
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        utm,
        firstname,
        companyname,
        companybenefits,
        obstacle1,
        obstacle2,
        obstacle3,
        solution1,
        solution2,
        solution3,
        flowtitle1,
        flow1,
        flowtitle2,
        flow2,
        flowtitle3,
        flow3,
        utmfull,
        profileurl,
        linkedinurl
      `)
      .eq('utm', utm)
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'UTM not found' })
      }
      throw error
    }

    // Format response to match your frontend expectations
    // ✅ FIXED: Using data.utm instead of data.url
    const response = {
      UTM: data.utm,                    // ✅ Fixed: was data.url
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
      // ✅ Bonus: Added the extra fields from your database
      UTM_Full: data.utmfull,
      Profile_URL: data.profileurl,
      LinkedIn_URL: data.linkedinurl
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    
    console.log(`✅ Found: ${data.firstname} at ${data.companyname}`)
    
    return res.status(200).json(response)

  } catch (error) {
    console.error('💥 Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
