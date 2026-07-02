import { AppCombobox } from '@/components/ui/AppCombobox'
import { useGetCategories } from '@/store/queries/useCategories'
import type { Category } from '@/types/category'

export interface CategoryValue {
  id?: string
  name: string
}

interface Props {
  value: CategoryValue
  onChange: (v: CategoryValue) => void
  allowCreate?: boolean
}

export function CategoryCombobox({ value, onChange, allowCreate = true }: Props) {
  const { data = [] } = useGetCategories()
  const options = (data as Category[]).map(c => ({ id: c.id, label: c.name }))

  return (
    <AppCombobox
      value={{ id: value.id, label: value.name }}
      onChange={v => onChange({ id: v.id, name: v.label })}
      options={options}
      allowCreate={allowCreate}
      placeholder="Search or create…"
    />
  )
}
