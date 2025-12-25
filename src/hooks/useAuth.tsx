import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

interface SignUpMetadata {
  full_name: string;
  phone?: string;
  role: 'farmer' | 'customer';
  // Farmer specific
  farm_name?: string;
  farm_location?: string;
  farm_size?: string;
  product_types?: string[];
  // Customer specific
  delivery_address?: string;
  city?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: SignUpMetadata) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: metadata.full_name,
          phone: metadata.phone,
          role: metadata.role,
        }
      }
    });

    if (error) return { error };

    // Create profile after successful signup
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          full_name: metadata.full_name,
          phone: metadata.phone || null,
          role: metadata.role,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { error: profileError as unknown as Error };
      }

      // Create role-specific profile
      if (metadata.role === 'farmer' && metadata.farm_name && metadata.farm_location) {
        const { error: farmerError } = await supabase
          .from('farmer_profiles')
          .insert({
            user_id: data.user.id,
            farm_name: metadata.farm_name,
            farm_location: metadata.farm_location,
            farm_size: metadata.farm_size || null,
            product_types: metadata.product_types || [],
          });

        if (farmerError) {
          console.error('Farmer profile creation error:', farmerError);
          return { error: farmerError as unknown as Error };
        }
      } else if (metadata.role === 'customer') {
        const { error: customerError } = await supabase
          .from('customer_profiles')
          .insert({
            user_id: data.user.id,
            delivery_address: metadata.delivery_address || null,
            city: metadata.city || null,
          });

        if (customerError) {
          console.error('Customer profile creation error:', customerError);
          return { error: customerError as unknown as Error };
        }
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
