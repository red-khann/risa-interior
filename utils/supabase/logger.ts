import { createClient } from './client'

export const logActivity = async (
  // 🎯 Included 'TIMEOUT' and maintained your action sequence
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

  // 🎯 Mapped strictly to all 7 columns including the new 'module' column
  const { error: dbError } = await supabase.from('admin_logs').insert({
    action_type: action,
    // 🎯 Maintains your bracketed prefix format
    item_name: `[${category}] ${itemName}`, 
    admin_id: user.id,        
    admin_email: user.email,
    module: category, // 🎯 Fills the module column with the category (PROJECT, AUTH, etc.)
    created_at: new Date().toISOString()
  })

  if (dbError) console.error("❌ DATABASE LOG ERROR:", dbError.message);
}