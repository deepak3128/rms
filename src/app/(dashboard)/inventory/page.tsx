"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { inr } from "@/lib/utils"
import type { Ingredient, InventoryTransaction } from "@/types"
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
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Pencil,
  Package,
  AlertTriangle,
  FlaskConical,
  Loader2,
  ArrowUpFromLine,
  ArrowDownToLine,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

function stockStatus(ing: Ingredient): { label: string; variant: "default" | "destructive" | "secondary" | "outline"; dot: string } {
  const ratio = ing.currentStock / Math.max(ing.minStockLevel, 1)
  if (ing.currentStock <= 0) return { label: "Out of stock", variant: "destructive", dot: "bg-destructive" }
  if (ratio < 1) return { label: "Low stock", variant: "destructive", dot: "bg-destructive" }
  if (ratio < 1.3) return { label: "Running low", variant: "secondary", dot: "bg-yellow-500" }
  return { label: "In stock", variant: "outline", dot: "bg-green-500" }
}

type IngredientForm = {
  name: string
  unit: string
  currentStock: number
  minStockLevel: number
  maxStockLevel: string
  unitPrice: number
}

const defaultForm: IngredientForm = {
  name: "",
  unit: "kg",
  currentStock: 0,
  minStockLevel: 10,
  maxStockLevel: "",
  unitPrice: 0,
}

type AdjustForm = {
  type: "adjustment" | "deduction" | "wastage"
  quantity: number
  reason: string
}

const defaultAdjust: AdjustForm = {
  type: "adjustment",
  quantity: 0,
  reason: "",
}

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Ingredient | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<IngredientForm>(defaultForm)
  const [adjusting, setAdjusting] = useState<Ingredient | null>(null)
  const [adjustForm, setAdjustForm] = useState<AdjustForm>(defaultAdjust)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await api.get<Ingredient[]>("/inventory/ingredients")
      setIngredients(data)
    } catch (e) {
      console.error("Failed to load ingredients", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditing(null)
    setForm(defaultForm)
    setShowForm(true)
  }

  function openEdit(ing: Ingredient) {
    setEditing(ing)
    setForm({
      name: ing.name,
      unit: ing.unit,
      currentStock: ing.currentStock,
      minStockLevel: ing.minStockLevel,
      maxStockLevel: ing.maxStockLevel ? String(ing.maxStockLevel) : "",
      unitPrice: ing.unitPrice,
    })
    setShowForm(true)
  }

  async function save() {
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        maxStockLevel: form.maxStockLevel ? Number(form.maxStockLevel) : undefined,
      }

      if (editing) {
        await api.patch(`/inventory/ingredients/${editing.id}`, payload)
        toast.success("Ingredient updated")
      } else {
        await api.post("/inventory/ingredients", payload)
        toast.success("Ingredient created")
      }
      setShowForm(false)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSubmitting(false)
    }
  }

  async function adjust() {
    if (!adjusting) return
    if (adjustForm.quantity === 0) {
      toast.error("Quantity must be non-zero")
      return
    }
    setSubmitting(true)
    try {
      const effectiveQty =
        adjustForm.type === "adjustment"
          ? adjustForm.quantity
          : -Math.abs(adjustForm.quantity)

      await api.post("/inventory/adjust", {
        ingredientId: adjusting.id,
        type: adjustForm.type,
        quantity: effectiveQty,
        reason: adjustForm.reason || undefined,
      })
      toast.success("Stock adjusted")
      setAdjusting(null)
      setAdjustForm(defaultAdjust)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to adjust")
    } finally {
      setSubmitting(false)
    }
  }

  const criticalLow = ingredients.filter((i) => i.currentStock < i.minStockLevel).length
  const runningLow = ingredients.filter(
    (i) => i.currentStock >= i.minStockLevel && i.currentStock < i.minStockLevel * 1.3
  ).length

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
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            {ingredients.length} ingredients &middot;
            {criticalLow > 0 && (
              <span className="text-destructive font-medium ml-1">
                {criticalLow} critical
              </span>
            )}
            {runningLow > 0 && (
              <span className="text-yellow-600 font-medium ml-1">
                &middot; {runningLow} running low
              </span>
            )}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Ingredient
        </Button>
      </div>

      {criticalLow > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {criticalLow} ingredient{criticalLow > 1 ? "s" : ""} below minimum stock level
            — order replenishment soon.
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ingredients.map((ing) => {
          const status = stockStatus(ing)
          return (
            <Card key={ing.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{ing.name}</div>
                    <div className="text-xs text-muted-foreground">{ing.unit}</div>
                  </div>
                  <Badge variant={status.variant} className="gap-1 text-[10px]">
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </Badge>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stock</span>
                    <span
                      className={`font-mono font-bold ${
                        ing.currentStock < ing.minStockLevel
                          ? "text-destructive"
                          : ""
                      }`}
                    >
                      {ing.currentStock} {ing.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min level</span>
                    <span className="font-mono">
                      {ing.minStockLevel} {ing.unit}
                    </span>
                  </div>
                  {ing.maxStockLevel && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Max level</span>
                      <span className="font-mono">
                        {ing.maxStockLevel} {ing.unit}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Unit price</span>
                    <span className="font-mono">{inr(ing.unitPrice)}</span>
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      ing.currentStock < ing.minStockLevel
                        ? "bg-destructive"
                        : ing.currentStock < ing.minStockLevel * 1.3
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (ing.currentStock / Math.max(ing.maxStockLevel || ing.minStockLevel * 2, 1)) *
                          100
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex items-center gap-1 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => openEdit(ing)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setAdjusting(ing)
                      setAdjustForm(defaultAdjust)
                    }}
                  >
                    <FlaskConical className="h-3.5 w-3.5 mr-1" />
                    Adjust
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {ingredients.length === 0 && (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
          <div className="text-center">
            <Package className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p>No ingredients yet. Add your first ingredient.</p>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Ingredient" : "New Ingredient"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update ingredient details and stock levels."
                : "Add a new ingredient to the inventory."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ing-name">Name</Label>
              <Input
                id="ing-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ing-unit">Unit</Label>
                <Select
                  value={form.unit}
                  onValueChange={(v) => setForm({ ...form, unit: v })}
                >
                  <SelectTrigger id="ing-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["kg", "g", "L", "mL", "pcs", "dozen", "packet", "bottle", "cup", "tsp", "tbsp"].map(
                      (u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ing-price">Unit Price (₹)</Label>
                <Input
                  id="ing-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.unitPrice || ""}
                  onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ing-stock">Current Stock</Label>
                <Input
                  id="ing-stock"
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.currentStock || ""}
                  onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ing-min">Min Stock Level</Label>
                <Input
                  id="ing-min"
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.minStockLevel || ""}
                  onChange={(e) => setForm({ ...form, minStockLevel: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ing-max">Max Stock Level (optional)</Label>
              <Input
                id="ing-max"
                type="number"
                min={0}
                step={0.1}
                value={form.maxStockLevel}
                onChange={(e) => setForm({ ...form, maxStockLevel: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={submitting}>
              {submitting ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Adjust Dialog */}
      <Dialog
        open={!!adjusting}
        onOpenChange={(open) => !open && setAdjusting(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              {adjusting?.name} &middot; Current stock:{" "}
              <span className="font-mono font-bold">
                {adjusting?.currentStock} {adjusting?.unit}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "adjustment", label: "Add stock", icon: ArrowUpFromLine },
                    { value: "deduction", label: "Deduction", icon: ArrowDownToLine },
                    { value: "wastage", label: "Wastage", icon: Trash2 },
                  ] as const
                ).map((opt) => {
                  const Icon = opt.icon
                  const active = adjustForm.type === opt.value
                  return (
                    <Button
                      key={opt.value}
                      variant={active ? "default" : "outline"}
                      size="sm"
                      className="h-16 flex-col gap-1 text-xs"
                      onClick={() => setAdjustForm({ ...adjustForm, type: opt.value as AdjustForm["type"] })}
                    >
                      <Icon className="h-4 w-4" />
                      {opt.label}
                    </Button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adj-qty">
                Quantity ({adjusting?.unit}) &middot;{" "}
                {adjustForm.type === "adjustment" ? "positive to add" : "positive to remove"}
              </Label>
              <Input
                id="adj-qty"
                type="number"
                step={0.1}
                value={adjustForm.quantity || ""}
                onChange={(e) =>
                  setAdjustForm({ ...adjustForm, quantity: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adj-reason">Reason</Label>
              <textarea
                id="adj-reason"
                rows={2}
                className="flex h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjusting(null)}>
              Cancel
            </Button>
            <Button onClick={adjust} disabled={submitting}>
              {submitting ? "Adjusting..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
