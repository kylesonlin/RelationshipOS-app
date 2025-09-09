import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Contact {
  id: string
  userId: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  title?: string
  notes?: string
  additional_fields?: any
  created_at: string
  updated_at: string
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('userId', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addContact = async (contactData: Omit<Contact, 'id' | 'userId' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contactData,
          userId: user.id
        })
        .select()
        .single()

      if (error) throw error

      setContacts(prev => [data, ...prev])
      toast({
        title: "Success",
        description: "Contact added successfully"
      })

      return data
    } catch (error) {
      console.error('Error adding contact:', error)
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive"
      })
    }
  }

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setContacts(prev => prev.map(contact => 
        contact.id === id ? { ...contact, ...data } : contact
      ))

      toast({
        title: "Success",
        description: "Contact updated successfully"
      })

      return data
    } catch (error) {
      console.error('Error updating contact:', error)
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive"
      })
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (error) throw error

      setContacts(prev => prev.filter(contact => contact.id !== id))
      toast({
        title: "Success",
        description: "Contact deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive"
      })
    }
  }

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refreshContacts: fetchContacts
  }
}