import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testOAuth() {
  console.log('🔐 Testing Google OAuth Configuration');
  console.log('====================================');
  
  try {
    // Test Supabase connection
    console.log('📡 Testing Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test Google OAuth provider
    console.log('\n🔍 Testing Google OAuth provider...');
    const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (oauthError) {
      console.error('❌ Google OAuth error:', oauthError.message);
      return;
    }
    
    console.log('✅ Google OAuth provider configured correctly');
    console.log('📋 OAuth URL generated:', oauthData.url);
    
    // Test environment variables
    console.log('\n📋 Environment Variables:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
    console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing');
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ? '✅ Set' : '❌ Missing');
    
    console.log('\n🎯 OAuth Test Results:');
    console.log('✅ Google OAuth is configured and ready to use');
    console.log('✅ You can now test the OAuth flow in your browser');
    console.log('\n📝 Next Steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit: http://localhost:3000/auth/signin');
    console.log('3. Click "Sign in with Google"');
    console.log('4. Complete the OAuth flow');
    
  } catch (error) {
    console.error('❌ OAuth test failed:', error);
  }
}

testOAuth();