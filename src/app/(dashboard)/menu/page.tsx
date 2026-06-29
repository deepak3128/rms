"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { inr } from "@/lib/utils"
import type { MenuItem, MenuCategory } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Image as ImageIcon,
} from "lucide-react"
import { toast } from "sonner"

type FormData = {
  name: string
  description: string
  categoryId: string
  price: number
  gstRate: number
  hsnCode: string
  prepTimeMinutes: number
  image: string
  isDailySpecial: boolean
  isAvailable: boolean
}

const defaultForm: FormData = {
  name: "",
  description: "",
  categoryId: "",
  price: 0,
  gstRate: 5,
  hsnCode: "00000000",
  prepTimeMinutes: 10,
  image: "",
  isDailySpecial: false,
  isAvailable: true,
}

const gstRates = [0, 5, 12, 18, 28]

export default function MenuPage() {
  const [items, setItems] = useState<(MenuItem & { category?: MenuCategory })[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormData>(defaultForm)

  const load = useCallback(async () => {
    try {
      const [itemsData, cats] = await Promise.all([
        api.get<(MenuItem & { category?: MenuCategory })[]>("/menu/items"),
        api.get<MenuCategory[]>("/menu/categories"),
      ])
      setItems(itemsData)
      setCategories(cats)
    } catch (e) {
      console.error("Failed to load menu", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditing(null)
    setForm({ ...defaultForm, categoryId: categories[0]?.id || "" })
    setShowForm(true)
  }

  function openEdit(item: MenuItem & { category?: MenuCategory }) {
    setEditing(item)
    setForm({
      name: item.name,
      description: item.description || "",
      categoryId: item.categoryId,
      price: item.price,
      gstRate: item.gstRate,
      hsnCode: item.hsnCode,
      prepTimeMinutes: item.prepTimeMinutes,
      image: item.image || "",
      isDailySpecial: item.isDailySpecial,
      isAvailable: item.isAvailable,
    })
    setShowForm(true)
  }

  async function save() {
    try {
      const payload = {
        ...form,
        description: form.description || undefined,
        image: form.image || undefined,
      }

      if (editing) {
        await api.patch(`/menu/items/${editing.id}`, payload)
        toast.success("Item updated")
      } else {
        await api.post("/menu/items", payload)
        toast.success("Item created")
      }
      setShowForm(false)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
    }
  }

  async function toggleAvailability(item: MenuItem) {
    try {
      await api.patch(`/menu/items/${item.id}`, { isAvailable: !item.isAvailable })
      toast.success(item.isAvailable ? "Item hidden" : "Item visible")
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to toggle")
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return
    try {
      await api.delete(`/menu/items/${id}`)
      toast.success("Item deleted")
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  const byCategory = new Map<string, (MenuItem & { category?: MenuCategory })[]>()
  items.forEach((i) => {
    const list = byCategory.get(i.categoryId) || []
    list.push(i)
    byCategory.set(i.categoryId, list)
  })

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu Catalogue</h1>
          <p className="text-sm text-muted-foreground">Manage items and categories</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Item
        </Button>
      </div>

      {categories.map((cat) => {
        const catItems = byCategory.get(cat.id) || []
        if (catItems.length === 0) return null
        return (
          <section key={cat.id}>
            <h2 className="text-lg font-bold mb-3">{cat.name}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-0 flex">
                    {item.image && (
                      <div className="w-28 shrink-0 bg-muted flex items-center justify-center overflow-hidden rounded-l-lg">
                        <img
                          src={item.image}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none"
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold truncate flex items-center gap-1">
                          {item.name}
                          {item.isDailySpecial && (
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          )}
                        </div>
                        <span className="font-bold text-lg whitespace-nowrap">
                          {inr(item.price)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        <Badge variant="outline" className="text-[10px]">
                          GST {item.gstRate}%
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${item.isAvailable ? "text-green-600 border-green-200" : "text-muted-foreground"}`}
                        >
                          {item.isAvailable ? "Available" : "Hidden"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => toggleAvailability(item)}
                        >
                          {item.isAvailable ? (
                            <ToggleRight className="h-3.5 w-3.5 text-green-600 mr-1" />
                          ) : (
                            <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                          )}
                          {item.isAvailable ? "Hide" : "Show"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )
      })}

      {items.length === 0 && (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
          <div className="text-center">
            <ImageIcon className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p>No menu items yet. Add your first item.</p>
          </div>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Item" : "New Menu Item"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <textarea
                  id="desc"
                  rows={2}
                  className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) => setForm({ ...form, categoryId: v })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price || ""}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Rate (%)</Label>
                  <Select
                    value={String(form.gstRate)}
                    onValueChange={(v) => setForm({ ...form, gstRate: Number(v) })}
                  >
                    <SelectTrigger id="gst">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gstRates.map((r) => (
                        <SelectItem key={r} value={String(r)}>
                          {r}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hsn">HSN Code</Label>
                  <Input
                    id="hsn"
                    value={form.hsnCode}
                    onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prep">Prep Time (min)</Label>
                  <Input
                    id="prep"
                    type="number"
                    min={1}
                    value={form.prepTimeMinutes || ""}
                    onChange={(e) =>
                      setForm({ ...form, prepTimeMinutes: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="special"
                  type="checkbox"
                  checked={form.isDailySpecial}
                  onChange={(e) => setForm({ ...form, isDailySpecial: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="special" className="text-sm">
                  Mark as today&apos;s special
                </Label>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={save}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
