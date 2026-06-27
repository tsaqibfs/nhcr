import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useAuthStore } from './auth'

export const useZakatStore = defineStore('zakat', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const ricePrice = ref(15000)

  const authStore = useAuthStore()

  const getMockZakat = () => {
    const saved = localStorage.getItem('simajid_mock_zakat')
    if (saved) return JSON.parse(saved)
    
    const defaults = [
      {
        id: 'zakat-mock-1',
        user_id: 'mock-jamaah-id',
        full_name: 'Budi Darmawan',
        zakat_type: 'fitrah',
        amount: 180000,
        rice_weight_kg: 10.00, // 4 people fitrah
        status: 'success',
        payment_method: 'transfer',
        attachment_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=300',
        family_members: [
          { name: 'Budi Darmawan', address: 'Jl. Merdeka No. 5' },
          { name: 'Siti Aminah', address: 'Jl. Merdeka No. 5' },
          { name: 'Fulan Darmawan', address: 'Jl. Merdeka No. 5' },
          { name: 'Fulanah Darmawan', address: 'Jl. Merdeka No. 5' }
        ],
        created_at: '2026-06-21T09:00:00Z'
      }
    ]
    localStorage.setItem('simajid_mock_zakat', JSON.stringify(defaults))
    return defaults
  }

  const fetchRicePrice = async () => {
    // 1. Check local storage first
    const savedLocal = localStorage.getItem('simajid_rice_price')
    if (savedLocal) {
      ricePrice.value = parseInt(savedLocal, 10)
    }

    if (authStore.isMockMode) {
      return
    }

    // 2. Try fetching from Supabase settings table if not in mock mode
    try {
      const { data, error: err } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'rice_price')
        .single()
      
      if (err) throw err
      if (data) {
        ricePrice.value = parseInt(data.value, 10)
        localStorage.setItem('simajid_rice_price', data.value)
      }
    } catch (err) {
      // Graceful fallback to local storage
      console.log('Using local rice price fallback. DB notice:', err.message)
    }
  }

  const updateRicePrice = async (newPrice) => {
    ricePrice.value = newPrice
    localStorage.setItem('simajid_rice_price', newPrice.toString())

    if (authStore.isMockMode) {
      return
    }

    // Attempt to upsert/update in Supabase settings
    try {
      // Check if row exists first
      const { data, error: fetchErr } = await supabase
        .from('settings')
        .select('key')
        .eq('key', 'rice_price')
        .single()

      if (fetchErr && fetchErr.code !== 'PGRST116') { // PGRST116 is single row not found
        throw fetchErr
      }

      if (data) {
        // Update
        const { error: updateErr } = await supabase
          .from('settings')
          .update({ value: newPrice.toString() })
          .eq('key', 'rice_price')
        if (updateErr) throw updateErr
      } else {
        // Insert
        const { error: insertErr } = await supabase
          .from('settings')
          .insert({ key: 'rice_price', value: newPrice.toString() })
        if (insertErr) throw insertErr
      }
    } catch (err) {
      console.error('Failed to update rice price in Supabase:', err.message)
      // We don't throw because we want to succeed locally at least
    }
  }

  const fetchZakat = async () => {
    loading.value = true
    error.value = null

    if (authStore.isMockMode) {
      setTimeout(() => {
        const mockData = getMockZakat()
        if (authStore.isAdmin) {
          items.value = mockData
            .map(item => ({ ...item, full_name: 'Hamba Allah' }))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        } else {
          items.value = mockData
            .filter(item => item.user_id === authStore.user?.id)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }
        loading.value = false
      }, 500)
      return
    }

    try {
      let query = supabase
        .from('zakat')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
      
      if (!authStore.isAdmin) {
        query = query.eq('user_id', authStore.user?.id)
      }

      const { data, error: err } = await query.order('created_at', { ascending: false })
      if (err) throw err

      items.value = data.map(item => ({
        ...item,
        full_name: authStore.isAdmin ? 'Hamba Allah' : (item.profiles?.full_name || 'Hamba Allah')
      }))
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch zakat:', err)
    } finally {
      loading.value = false
    }
  }

  const uploadReceipt = async (file) => {
    if (!file) return null
    
    if (authStore.isMockMode) {
      return URL.createObjectURL(file)
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `zakat_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const { data, error: uploadErr } = await supabase.storage
        .from('payments')
        .upload(fileName, file)

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from('payments')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (err) {
      console.error('Error uploading receipt:', err)
      throw err
    }
  }

  const submitZakat = async (zakatData, file = null) => {
    loading.value = true
    error.value = null

    try {
      const attachmentUrl = await uploadReceipt(file)
      const newZakat = {
        user_id: authStore.user?.id || null,
        zakat_type: 'fitrah', // Only Fitrah is supported now
        amount: zakatData.amount || 0,
        rice_weight_kg: zakatData.rice_weight_kg || null,
        payment_method: zakatData.payment_method,
        attachment_url: attachmentUrl,
        status: 'pending',
        family_members: zakatData.family_members || [], // JSON/JSONB column
        created_at: new Date().toISOString()
      }

      if (authStore.isMockMode) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const mockData = getMockZakat()
            const created = {
              id: 'zakat-mock-' + Math.random().toString(36).substr(2, 9),
              ...newZakat,
              full_name: authStore.user?.full_name || 'Jamaah'
            }
            mockData.push(created)
            localStorage.setItem('simajid_mock_zakat', JSON.stringify(mockData))
            items.value.unshift(created)
            loading.value = false
            resolve(created)
          }, 600)
        })
      }

      const { data, error: insertErr } = await supabase
        .from('zakat')
        .insert(newZakat)
        .select()
        .single()

      if (insertErr) throw insertErr
      
      await fetchZakat()
      return data
    } catch (err) {
      error.value = err.message
      loading.value = false
      throw err
    }
  }

  const updateStatus = async (id, status) => {
    loading.value = true
    error.value = null

    if (authStore.isMockMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockData = getMockZakat()
          const index = mockData.findIndex(item => item.id === id)
          if (index !== -1) {
            mockData[index].status = status
            localStorage.setItem('simajid_mock_zakat', JSON.stringify(mockData))
            const itemIndex = items.value.findIndex(item => item.id === id)
            if (itemIndex !== -1) items.value[itemIndex].status = status
          }
          loading.value = false
          resolve()
        }, 400)
      })
    }

    try {
      const { error: updateErr } = await supabase
        .from('zakat')
        .update({ status })
        .eq('id', id)

      if (updateErr) throw updateErr
      await fetchZakat()
    } catch (err) {
      error.value = err.message
      loading.value = false
      throw err
    }
  }

  return {
    items,
    loading,
    error,
    ricePrice,
    fetchZakat,
    submitZakat,
    updateStatus,
    fetchRicePrice,
    updateRicePrice
  }
})
