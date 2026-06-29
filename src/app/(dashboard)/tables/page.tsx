"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import type { Table as TableType } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const statusMeta: Record<string, { label: string; ring: string; bg: string }> = {
  available: { label: "Available", ring: "ring-green-500", bg: "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900" },
  occupied: { label: "Occupied", ring: "ring-red-500", bg: "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900" },
  reserved: { label: "Reserved", ring: "ring-yellow-500", bg: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900" },
  cleaning: { label: "Cleaning", ring: "ring-blue-500", bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900" },
}

function elapsed(date?: Date | string) {
  if (!date) return ""
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  return `${m}m`
}

export default function TablesPage() {
  const [tables, setTables] = useState<TableType[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await api.get<TableType[]>("/tables")
      setTables(data)
    } catch (e) {
      console.error("Failed to load tables", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const i = setInterval(load, 8000)
    return () => clearInterval(i)
  }, [load])

  async function setStatus(id: string, status: string) {
    try {
      await api.patch(`/tables/${id}`, { status })
      toast.success(`Table status updated to ${status}`)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update")
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Floor Map</h1>
        <p className="text-sm text-muted-foreground">Live table status</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(statusMeta).map(([k, v]) => (
          <Badge key={k} variant="outline" className="gap-1.5">
            <span className={`h-2 w-2 rounded-full ${v.ring.replace("ring-", "bg-")}`} />
            {v.label}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {tables.map((t) => {
          const meta = statusMeta[t.status] || statusMeta.available
          return (
            <Card
              key={t.id}
              className={`${meta.bg} border-2 transition-transform hover:-translate-y-0.5`}
            >
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <span className="text-3xl font-bold">{t.number}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {meta.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.capacity} seats
                  {t.status === "occupied" && t.occupancyStartedAt && (
                    <span className="ml-1 font-mono">
                      &middot; {elapsed(t.occupancyStartedAt)}
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {Object.entries(statusMeta)
                    .filter(([s]) => s !== t.status)
                    .map(([s]) => (
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-1"
                        onClick={() => setStatus(t.id, s)}
                      >
                        {s}
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
