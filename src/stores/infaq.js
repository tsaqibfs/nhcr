import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useAuthStore } from './auth'

export const useInfaqStore = defineStore('infaq', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const authStore = useAuthStore()

  const getMockInfaq = () => {
    const saved = localStorage.getItem('simajid_mock_infaq')
    if (saved) return JSON.parse(saved)
    
    const defaults = [
      {
        id: 'infaq-mock-1',
        user_id: 'mock-jamaah-id',
        full_name: 'Hamba Allah',
        amount: 150000,
        type: 'jumat',
        status: 'success',
        payment_method: 'qris',
        attachment_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=300',
        created_at: '2026-06-20T10:00:00Z'
      },
      {
        id: 'infaq-mock-2',
        user_id: null,
        full_name: 'Hamba Allah',
        amount: 500000,
        type: 'anak_yatim',
        status: 'pending',
        payment_method: 'transfer',
        attachment_url: '',
        created_at: '2026-06-25T08:30:00Z'
      },
      {
        id: 'infaq-mock-3',
        user_id: 'mock-jamaah-id',
        full_name: 'Hamba Allah',
        amount: 1000000,
        type: 'operasional',
        status: 'pending',
        payment_method: 'transfer',
        attachment_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=300',
        created_at: '2026-06-25T09:00:00Z'
      }
    ]
    localStorage.setItem('simajid_mock_infaq', JSON.stringify(defaults))
    return defaults
  }

  const fetchInfaq = async () => {
    loading.value = true
    error.value = null

    if (authStore.isMockMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockData = getMockInfaq().map(item => ({
            ...item,
            full_name: 'Hamba Allah'
          }))
          if (authStore.isAdmin) {
            items.value = mockData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          } else {
            items.value = mockData
              .filter(item => item.user_id === authStore.user?.id)
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          }
          loading.value = false
          resolve(items.value)
        }, 500)
      })
    }

    try {
      let query = supabase
        .from('infaq')
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
        full_name: 'Hamba Allah'
      }))
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch infaq:', err)
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
      const fileName = `infaq_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
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

  const submitInfaq = async (infaqData, file = null) => {
    loading.value = true
    error.value = null

    try {
      const attachmentUrl = await uploadReceipt(file)
      const newInfaq = {
        user_id: infaqData.hasOwnProperty('user_id') ? infaqData.user_id : (authStore.user?.id || null),
        amount: infaqData.amount,
        type: infaqData.type,
        payment_method: infaqData.payment_method || 'cash',
        attachment_url: attachmentUrl || '',
        status: infaqData.status || 'pending',
        created_at: infaqData.created_at ? new Date(infaqData.created_at).toISOString() : new Date().toISOString()
      }

      if (authStore.isMockMode) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const mockData = getMockInfaq()
            const created = {
              id: 'infaq-mock-' + Math.random().toString(36).substr(2, 9),
              ...newInfaq,
              full_name: 'Hamba Allah'
            }
            mockData.push(created)
            localStorage.setItem('simajid_mock_infaq', JSON.stringify(mockData))
            items.value.unshift(created)
            loading.value = false
            resolve(created)
          }, 600)
        })
      }

      const { data, error: insertErr } = await supabase
        .from('infaq')
        .insert(newInfaq)
        .select()
        .single()

      if (insertErr) throw insertErr
      
      await fetchInfaq()
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
          const mockData = getMockInfaq()
          const index = mockData.findIndex(item => item.id === id)
          if (index !== -1) {
            mockData[index].status = status
            localStorage.setItem('simajid_mock_infaq', JSON.stringify(mockData))
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
        .from('infaq')
        .update({ status })
        .eq('id', id)

      if (updateErr) throw updateErr
      await fetchInfaq()
    } catch (err) {
      error.value = err.message
      loading.value = false
      throw err
    }
  }

  const fetchGlobalInfaq = async () => {
    if (authStore.isMockMode) {
      return getMockInfaq()
    }
    try {
      const { data, error: err } = await supabase
        .from('infaq')
        .select('*')
        .eq('status', 'success')
      if (err) throw err
      return data
    } catch (err) {
      console.error('Failed to fetch global infaq stats:', err)
      return []
    }
  }

  return {
    items,
    loading,
    error,
    fetchInfaq,
    fetchGlobalInfaq,
    submitInfaq,
    updateStatus
  }
})
