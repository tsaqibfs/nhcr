import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useAuthStore } from './auth'

export const useKurbanStore = defineStore('kurban', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Real-time active cow slot tracking
  const activeCow = ref({ number: 1, bookedSlots: [], bookings: [] })

  const authStore = useAuthStore()

  const getMockKurban = () => {
    const saved = localStorage.getItem('simajid_mock_kurban')
    if (saved) return JSON.parse(saved)
    
    const defaults = [
      {
        id: 'kurban-mock-1',
        user_id: 'mock-jamaah-id',
        full_name: 'Budi Darmawan',
        animal_type: 'sapi',
        joint_slot: 1, // slot 1/7 of Sapi #1
        price: 3500000,
        status: 'paid',
        payment_method: 'transfer',
        attachment_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=300',
        created_at: '2026-06-22T08:00:00Z'
      },
      {
        id: 'kurban-mock-2',
        user_id: 'mock-jamaah-id',
        full_name: 'Budi Darmawan',
        animal_type: 'kambing',
        joint_slot: null,
        price: 2800000,
        status: 'pending',
        payment_method: 'qris',
        attachment_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=300',
        created_at: '2026-06-25T14:15:00Z'
      }
    ]
    localStorage.setItem('simajid_mock_kurban', JSON.stringify(defaults))
    return defaults
  }

  const fetchKurban = async () => {
    loading.value = true
    error.value = null

    if (authStore.isMockMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockData = getMockKurban()
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
        .from('kurban')
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
        full_name: item.profiles?.full_name || 'Hamba Allah'
      }))
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch kurban:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchActiveCowSlots = async () => {
    // 1. Fetch latest kurban items
    await fetchKurban()
    
    // 2. Filter sapi bookings that are not cancelled
    const sapiBookings = items.value
      .filter(k => k.animal_type === 'sapi' && k.status !== 'cancelled')
      // Sort oldest first to group sequentially
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    const groups = []
    sapiBookings.forEach(booking => {
      // Find first group with length < 7 and no duplicate slot
      let added = false
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        const hasSlot = group.some(b => b.joint_slot === booking.joint_slot)
        if (group.length < 7 && !hasSlot) {
          group.push(booking)
          added = true
          break
        }
      }
      if (!added) {
        groups.push([booking])
      }
    })

    // Find the first group that has < 7 slots filled
    let activeGroupIndex = groups.findIndex(g => g.length < 7)
    let activeGroup = []
    let cowNumber = 1

    if (activeGroupIndex !== -1) {
      activeGroup = groups[activeGroupIndex]
      cowNumber = activeGroupIndex + 1
    } else {
      cowNumber = groups.length + 1
    }

    const bookedSlots = activeGroup.map(b => ({
      slot: b.joint_slot,
      full_name: b.full_name
    }))

    activeCow.value = {
      number: cowNumber,
      bookedSlots,
      bookings: activeGroup
    }
  }

  const uploadReceipt = async (file) => {
    if (!file) return null
    
    if (authStore.isMockMode) {
      return URL.createObjectURL(file)
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `kurban_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
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

  const submitKurban = async (kurbanData, file = null) => {
    loading.value = true
    error.value = null

    try {
      // Fetch active cow slots again in real-time to check availability
      await fetchActiveCowSlots()
      
      if (kurbanData.animal_type === 'sapi') {
        const slotTaken = activeCow.value.bookedSlots.some(s => s.slot === kurbanData.joint_slot)
        if (slotTaken) {
          throw new Error(`Slot #${kurbanData.joint_slot} untuk Kelompok Sapi #${activeCow.value.number} baru saja diambil oleh jamaah lain. Silakan pilih slot lain.`)
        }
      }

      const attachmentUrl = await uploadReceipt(file)
      const newKurban = {
        user_id: authStore.user?.id || null,
        animal_type: kurbanData.animal_type,
        joint_slot: kurbanData.joint_slot || null,
        price: kurbanData.price,
        payment_method: kurbanData.payment_method,
        attachment_url: attachmentUrl,
        status: 'pending',
        created_at: new Date().toISOString()
      }

      if (authStore.isMockMode) {
        return new Promise((resolve) => {
          setTimeout(async () => {
            const mockData = getMockKurban()
            const created = {
              id: 'kurban-mock-' + Math.random().toString(36).substr(2, 9),
              ...newKurban,
              full_name: authStore.user?.full_name || 'Jamaah'
            }
            mockData.push(created)
            localStorage.setItem('simajid_mock_kurban', JSON.stringify(mockData))
            items.value.unshift(created)
            
            // Re-fetch slots to calculate new availability
            await fetchActiveCowSlots()
            
            loading.value = false
            resolve(created)
          }, 600)
        })
      }

      const { data, error: insertErr } = await supabase
        .from('kurban')
        .insert(newKurban)
        .select()
        .single()

      if (insertErr) throw insertErr
      
      await fetchActiveCowSlots()
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
        setTimeout(async () => {
          const mockData = getMockKurban()
          const index = mockData.findIndex(item => item.id === id)
          if (index !== -1) {
            mockData[index].status = status
            localStorage.setItem('simajid_mock_kurban', JSON.stringify(mockData))
            const itemIndex = items.value.findIndex(item => item.id === id)
            if (itemIndex !== -1) items.value[itemIndex].status = status
          }
          await fetchActiveCowSlots()
          loading.value = false
          resolve()
        }, 400)
      })
    }

    try {
      const { error: updateErr } = await supabase
        .from('kurban')
        .update({ status })
        .eq('id', id)

      if (updateErr) throw updateErr
      await fetchActiveCowSlots()
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
    activeCow,
    fetchKurban,
    fetchActiveCowSlots,
    submitKurban,
    updateStatus
  }
})
