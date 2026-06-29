"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import type { Order } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Loader2, QrCode, CreditCard, Banknote, Printer, Search, IndianRupee } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function CashierPage() {
  const [bills, setBills] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentModal, setPaymentModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  const fetchBills = useCallback(async () => {
    try {
      const data = await api.get<Order[]>("/orders?status=billed,pending")
      setBills(data)
    } catch (e) {
      console.error("Failed to fetch bills", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBills()
    const interval = setInterval(fetchBills, 10000)
    return () => clearInterval(interval)
  }, [fetchBills])

  async function handlePayment(method: string) {
    if (!selectedOrder) return
    setProcessing(true)
    try {
      await api.post("/payments", {
        orderId: selectedOrder.id,
        amount: selectedOrder.grandTotal,
        method,
        isOffline: method === "cash",
      })
      await api.patch(`/orders/${selectedOrder.id}`, {
        paymentStatus: "paid",
        paymentMethod: method,
      })
      toast.success(`Payment of ₹${selectedOrder.grandTotal} received`)
      setPaymentModal(false)
      setSelectedOrder(null)
      fetchBills()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed")
    } finally {
      setProcessing(false)
    }
  }

  async function handleGenerateBill(order: Order) {
    try {
      const invoice = await api.post("/billing", { orderId: order.id })
      toast.success(`Invoice ${(invoice as Record<string, unknown>).invoiceNumber} generated`)
      fetchBills()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate bill")
    }
  }

  const filtered = bills.filter((b) =>
    b.tableNumber.toString().includes(search) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground">Process payments and generate invoices</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by table or ID..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
          <div className="text-center">
            <IndianRupee className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No bills to process</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((bill) => {
            const items = (bill.items as Array<Record<string, unknown>>) || []
            return (
              <Card key={bill.id}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Table {bill.tableNumber}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {bill.id.slice(-6)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="space-y-1.5">
                    {items
                      .filter((i) => i.status !== "cancelled")
                      .map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>
                            {item.quantity as number}x {item.name as string}
                          </span>
                          <span>₹{(item.totalPrice as number).toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{bill.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax (GST)</span>
                      <span>₹{bill.taxAmount.toFixed(2)}</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span>₹{bill.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {bill.paymentStatus === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedOrder(bill)
                            setPaymentModal(true)
                          }}
                        >
                          Pay Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleGenerateBill(bill)}
                        >
                          <Printer className="mr-1.5 h-4 w-4" />
                          Bill
                        </Button>
                      </>
                    )}
                    {bill.paymentStatus === "paid" && (
                      <Badge variant="default" className="w-full justify-center bg-green-600">
                        Paid - {bill.paymentMethod}
                      </Badge>
                    )}
                    {bill.paymentStatus === "partial" && (
                      <Badge variant="secondary" className="w-full justify-center">
                        Partial Payment
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={paymentModal} onOpenChange={setPaymentModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="text-center">
              <p className="text-3xl font-bold">₹{selectedOrder?.grandTotal.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Table {selectedOrder?.tableNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex-col gap-1"
                disabled={processing}
                onClick={() => handlePayment("upi")}
              >
                <QrCode className="h-6 w-6" />
                <span className="text-xs">UPI</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-1"
                disabled={processing}
                onClick={() => handlePayment("card")}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-xs">Card</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-1"
                disabled={processing}
                onClick={() => handlePayment("netbanking")}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-xs">Netbanking</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-1"
                disabled={processing}
                onClick={() => handlePayment("cash")}
              >
                <Banknote className="h-6 w-6" />
                <span className="text-xs">Cash</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
