import { AppCombobox } from '@/components/ui/AppCombobox'
import { useGetVendors } from '@/store/queries/useVendors'
import type { Vendor } from '@/types/vendor'

export interface VendorValue {
  id?: string
  name: string
  phone: string
  email: string
}

interface Props {
  value: VendorValue
  onChange: (v: VendorValue) => void
}

export function VendorCombobox({ value, onChange }: Props) {
  const { data = [] } = useGetVendors()
  const vendors = data as Vendor[]

  return (
    <AppCombobox
      value={{ id: value.id, label: value.name }}
      onChange={v => {
        if (v.id) {
          // Existing vendor selected — prefill all contact fields
          const full = vendors.find(vendor => vendor.id === v.id)
          onChange({ id: v.id, name: v.label, phone: full?.phone ?? '', email: full?.email ?? '' })
        } else {
          // User is typing a new name — preserve any phone/email they've entered
          onChange({ ...value, id: undefined, name: v.label })
        }
      }}
      options={vendors.map(v => ({ id: v.id, label: v.name }))}
      allowCreate
      placeholder="Search or create…"
    />
  )
}
