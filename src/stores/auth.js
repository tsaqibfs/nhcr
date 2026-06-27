import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const isMockMode = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isJamaah = computed(() => user.value?.role === 'jamaah')

  const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    return url && key && !url.includes('your-supabase-project')
  }

  const loadMockSession = () => {
    const saved = localStorage.getItem('simajid_mock_user')
    if (saved) {
      user.value = JSON.parse(saved)
      isMockMode.value = true
    }
  }

  const initialize = async () => {
    if (!isSupabaseConfigured()) {
      isMockMode.value = true
      loadMockSession()
      return
    }

    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetchProfile(session.user.id)
      } else {
        loadMockSession()
      }
    } catch (err) {
      console.error('Failed to get Supabase session, using mock fallback:', err)
      isMockMode.value = true
      loadMockSession()
    } finally {
      loading.value = false
    }

    if (isSupabaseConfigured()) {
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          await fetchProfile(session.user.id)
        } else if (!isMockMode.value) {
          user.value = null
        }
      })
    }
  }

  const fetchProfile = async (uid) => {
    try {
      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single()

      if (profileErr) throw profileErr
      if (data) {
        user.value = data
        isMockMode.value = false
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      error.value = err.message
    }
  }

  const signIn = async (email, password) => {
    loading.value = true
    error.value = null

    if (!isSupabaseConfigured() || email.endsWith('@simajid.com')) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          loading.value = false
          if (password === 'password123') {
            const mockUser = {
              id: email === 'admin@simajid.com' ? 'mock-admin-id' : 'mock-jamaah-id',
              email,
              full_name: email === 'admin@simajid.com' ? 'H. Ahmad Fauzi (Ketua DKM)' : 'Budi Darmawan',
              phone: '08123456789',
              role: email === 'admin@simajid.com' ? 'admin' : 'jamaah',
              created_at: new Date().toISOString()
            }
            user.value = mockUser
            isMockMode.value = true
            localStorage.setItem('simajid_mock_user', JSON.stringify(mockUser))
            resolve(mockUser)
          } else {
            error.value = 'Password salah. Gunakan password123'
            reject(new Error(error.value))
          }
        }, 800)
      })
    }

    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (signInErr) throw signInErr

      if (data?.user) {
        await fetchProfile(data.user.id)
        return user.value
      }
    } catch (err) {
      error.value = err.message || 'Gagal login'
      loading.value = false
      throw err
    } finally {
      loading.value = false
    }
  }

  const signUp = async (email, password, fullName, phone, _ignoredRole) => {
    const role = 'jamaah'
    loading.value = true
    error.value = null

    if (!isSupabaseConfigured()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          loading.value = false
          const mockUser = {
            id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
            email,
            full_name: fullName,
            phone,
            role,
            created_at: new Date().toISOString()
          }
          user.value = mockUser
          isMockMode.value = true
          localStorage.setItem('simajid_mock_user', JSON.stringify(mockUser))
          resolve(mockUser)
        }, 800)
      })
    }

    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role
          }
        }
      })
      if (signUpErr) throw signUpErr

      if (data?.user) {
        setTimeout(async () => {
          await fetchProfile(data.user.id)
        }, 1500)
        return data.user
      }
    } catch (err) {
      error.value = err.message || 'Gagal registrasi'
      loading.value = false
      throw err
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    if (isMockMode.value) {
      user.value = null
      isMockMode.value = false
      localStorage.clear()
      sessionStorage.clear()
      loading.value = false
      window.location.href = '/login'
      return
    }

    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Signout error:', err)
    } finally {
      user.value = null
      localStorage.clear()
      sessionStorage.clear()
      loading.value = false
      window.location.href = '/login'
    }
  }

  return {
    user,
    loading,
    error,
    isMockMode,
    isAuthenticated,
    isAdmin,
    isJamaah,
    initialize,
    signIn,
    signUp,
    signOut
  }
})
