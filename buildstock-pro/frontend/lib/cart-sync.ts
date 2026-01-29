import { createClient } from '@/lib/supabase/client';

interface CartItem {
  material_id: string;
  quantity: number;
}

interface CartItemDb {
  user_id?: string;
  session_id?: string | null;
  material_id: string;
  quantity: number;
}

/**
 * Merge guest cart with user cart when signing in
 */
export async function mergeCartWithUserCart(sessionId: string, userId: string) {
  const supabase = createClient();

  try {
    // Get guest cart items
    const { data: guestItems, error: guestError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId);

    if (guestError) throw guestError;

    if (!guestItems || guestItems.length === 0) {
      // No guest items to merge, just update session
      await clearGuestCart(sessionId);
      return { success: true };
    }

    // Get user's existing cart items
    const { data: userItems, error: userError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId);

    if (userError) throw userError;

    // Merge carts: if item exists in both, sum quantities
    const mergedItems = new Map<string, CartItem>();

    // Add user items first
    userItems?.forEach((item: any) => {
      mergedItems.set(item.material_id, {
        material_id: item.material_id,
        quantity: item.quantity,
      });
    });

    // Add/merge guest items
    guestItems.forEach((guestItem: any) => {
      const existing = mergedItems.get(guestItem.material_id);
      if (existing) {
        existing.quantity += guestItem.quantity;
      } else {
        mergedItems.set(guestItem.material_id, {
          material_id: guestItem.material_id,
          quantity: guestItem.quantity,
        });
      }
    });

    // Delete all guest cart items
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) throw deleteError;

    // Delete all user cart items
    const { error: deleteUserError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (deleteUserError) throw deleteUserError;

    // Insert merged items
    const itemsToInsert: CartItemDb[] = Array.from(mergedItems.entries()).map(([materialId, item]) => ({
      user_id: userId,
      material_id: materialId,
      quantity: item.quantity,
      session_id: null,
    }));

    const { error: insertError } = await supabase
      .from('cart_items')
      .insert(itemsToInsert as any);

    if (insertError) throw insertError;

    return { success: true, itemCount: itemsToInsert.length };
  } catch (error) {
    console.error('Error merging cart:', error);
    return { success: false, error };
  }
}

/**
 * Clear guest cart after successful merge
 */
export async function clearGuestCart(sessionId: string) {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error clearing guest cart:', error);
    return { success: false, error };
  }
}

/**
 * Convert guest cart to user cart on sign up
 */
export async function convertGuestCartToUserCart(sessionId: string, userId: string) {
  return mergeCartWithUserCart(sessionId, userId);
}
