"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Printer, CreditCard, Banknote, QrCode } from "lucide-react"
import { Input } from "@/components/ui/input"

const bills = [
  {
    id: "BILL-001",
    table: 5,
    items: [
      { name: "Butter Chicken (Half)", qty: 2, price: 420 },
      { name: "Naan", qty: 4, price: 160 },
      { name: "Dal Makhani (Full)", qty: 1, price: 350 },
    ],
    total: 930,
    tax: 167,
    grandTotal: 1097,
    status: "pending",
  },
  {
    id: "BILL-002",
    table: 2,
    items: [
      { name: "Chicken Biryani (Full)", qty: 1, price: 350 },
    ],
    total: 350,
    tax: 63,
    grandTotal: 413,
    status: "pending",
  },
]

export default function CashierPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground">Process payments and generate invoices</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-8" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {bills.map((bill) => (
          <Card key={bill.id}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Table {bill.table}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {bill.id}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="space-y-1.5">
                {bill.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>
                      {item.qty}x {item.name}
                    </span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{bill.total}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (GST)</span>
                  <span>₹{bill.tax}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{bill.grandTotal}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <QrCode className="mr-1.5 h-4 w-4" />
                  UPI
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <CreditCard className="mr-1.5 h-4 w-4" />
                  Card
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Banknote className="mr-1.5 h-4 w-4" />
                  Cash
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Printer className="mr-1.5 h-4 w-4" />
                  Print
                </Button>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1">
                  Split Bill
                </Button>
                <Button size="sm" variant="secondary" className="flex-1">
                  Pay Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
