import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  // Tell everyone they can talk to our robot
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Wrong way to ask!' })
  }

  // Get the special code from the website
  const { utm } = req.query
  if (!utm) {
    return res.status(400).json({ error: 'You forgot to tell me which person!' })
  }

  try {
    // Ask the database for information
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('utm', utm)
      .single()

    if (error) {
      return res.status(404).json({ error: 'Person not found in our book!' })
    }

    // Give back the information in the old format your website expects
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

    return res.status(200).json(response)

  } catch (error) {
    return res.status(500).json({ error: 'Robot is broken!' })
  }
}
