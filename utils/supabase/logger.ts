import { createClient } from './client'

export const logActivity = async (
  // Expanded actions to include AUTH events
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE' | 'LOGIN' | 'LOGOUT' | 'TIMEOUT', 
  itemName: string,
  category: 'PROJECT' | 'SERVICE' | 'JOURNAL' | 'CONTENT' | 'AUTH'
) => {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error("❌ LOGGER ERROR: No authenticated user found", authError);
    return;
  }

  // item_name is used to store the specific reason or message for the dashboard
  const { error: dbError } = await supabase.from('admin_logs').insert({
    action_type: action,
    item_name: `[${category}] ${itemName}`,
    admin_id: user.id,        
    admin_email: user.email    
  })

  if (dbError) console.error("❌ DATABASE LOG ERROR:", dbError.message);
}