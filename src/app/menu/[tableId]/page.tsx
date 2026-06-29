import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import type { MenuVariant } from "@/types"

export async function generateStaticParams() {
  return []
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ tableId: string }>
}) {
  const { tableId } = await params

  const [table, categories, items] = await Promise.all([
    prisma.table.findUnique({ where: { id: tableId } }),
    prisma.menuCategory.findMany({
      where: { isActive: true, restaurantId: "default" },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.menuItem.findMany({
      where: { isAvailable: true, restaurantId: "default" },
      orderBy: [{ categoryId: "asc" }, { name: "asc" }],
    }),
  ])

  if (!table) {
    notFound()
  }

  const itemsByCategory = new Map<string, typeof items>()
  for (const item of items) {
    const existing = itemsByCategory.get(item.categoryId) || []
    existing.push(item)
    itemsByCategory.set(item.categoryId, existing)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">Tandoori Flame</h1>
              <p className="text-xs text-muted-foreground">{table.name} &middot; Enjoy your meal!</p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>Table {table.number}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4 space-y-6">
        {categories.map((category) => {
          const catItems = itemsByCategory.get(category.id) || []
          if (catItems.length === 0) return null

          return (
            <section key={category.id}>
              <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-3">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-xs text-muted-foreground mb-2 -mt-2">{category.description}</p>
              )}
              <div className="divide-y rounded-lg border bg-white">
                {catItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <span className="text-sm font-semibold whitespace-nowrap">
                          ₹{item.price}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.variants && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {(item.variants as MenuVariant[]).map((v) => (
                            <span
                              key={v.name}
                              className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {v.name} &middot; ₹{v.price}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </main>

      <footer className="mx-auto max-w-2xl px-4 py-6 text-center text-xs text-muted-foreground border-t mt-8">
        <p>Tandoori Flame Restaurant &middot; 42, MG Road, Connaught Place, New Delhi</p>
        <p className="mt-1">
          Scan this QR code again to view the menu on your phone
        </p>
      </footer>
    </div>
  )
}
