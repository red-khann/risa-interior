import { createClient } from './client'

export const logActivity = async (
  // 🎯 Added 'APPROVE' and 'REJECT' for specific Review actions
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE' | 'LOGIN' | 'LOGOUT' | 'TIMEOUT' | 'APPROVE' | 'REJECT', 
  itemName: string,
  // 🎯 Added 'REVIEW' category
  category: 'PROJECT' | 'SERVICE' | 'JOURNAL' | 'CONTENT' | 'AUTH' | 'REVIEW'
) => {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error("❌ LOGGER ERROR: No authenticated user found", authError);
    return;
  }

  const { error: dbError } = await supabase.from('admin_logs').insert({
    action_type: action,
    // 🎯 Maintains your format: e.g., "[REVIEW] Approved: John Doe"
    item_name: `[${category}] ${itemName}`, 
    admin_id: user.id,        
    admin_email: user.email,
    module: category, 
    created_at: new Date().toISOString()
  })

  if (dbError) console.error("❌ DATABASE LOG ERROR:", dbError.message);
}