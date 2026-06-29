"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { inr } from "@/lib/utils"
import type { Order, Payment } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Receipt,
  CheckCircle,
  CreditCard,
  QrCode,
  Banknote,
  ArrowLeftRight,
  Loader2,
  Search,
  IndianRupee,
} from "lucide-react"
import { toast } from "sonner"

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export default function CashierPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [bills, setBills] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [discount, setDiscount] = useState(0)
  const [discountReason, setDiscountReason] = useState("")
  const [generatedBill, setGeneratedBill] = useState<Order | null>(null)
  const [processing, setProcessing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [o, b] = await Promise.all([
        api.get<Order[]>("/orders?status=pending,preparing,ready,served"),
        api.get<Order[]>("/orders?paymentStatus=paid"),
      ])
      setOrders(o)
      setBills(b.slice(0, 8))
    } catch (e) {
      console.error("Failed to load data", e)
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 8000)
    return () => clearInterval(t)
  }, [load])

  useEffect(() => {
    if (!document.getElementById("rzp")) {
      const s = document.createElement("script")
      s.id = "rzp"
      s.src = "https://checkout.razorpay.com/v1/checkout.js"
      s.async = true
      document.body.appendChild(s)
    }
  }, [])

  const subtotal =
    selected?.items
      .filter((i) => i.status !== "cancelled")
      .reduce((s, i) => s + i.totalPrice, 0) || 0
  const afterDiscount = Math.max(0, subtotal - discount)
  const cgst = +(afterDiscount * 0.025).toFixed(2)
  const sgst = +(afterDiscount * 0.025).toFixed(2)
  const total = +(afterDiscount + cgst + sgst).toFixed(2)

  async function generateBill() {
    if (!selected) return
    setProcessing(true)
    try {
      const inv = await api.post<Order>("/billing", {
        orderId: selected.id,
        discount,
        discountReason,
      })
      setGeneratedBill(inv)
      toast.success(`Bill ${(inv as Record<string, unknown>).invoiceNumber} generated`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate bill")
    } finally {
      setProcessing(false)
    }
  }

  async function pay(method: string) {
    if (!generatedBill) return
    setProcessing(true)
    try {
      await api.post("/payments", {
        orderId: generatedBill.id,
        amount: generatedBill.grandTotal,
        method,
        isOffline: method === "cash",
      })
      await api.patch(`/orders/${generatedBill.id}`, {
        paymentStatus: "paid",
        paymentMethod: method,
      })
      toast.success(`Paid via ${method.toUpperCase()}`)
      reset()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed")
    } finally {
      setProcessing(false)
    }
  }

  async function payRazorpay() {
    if (!generatedBill) return
    setProcessing(true)
    try {
      const j = await api.post<Record<string, unknown>>("/payments/razorpay/create-order", {
        billId: generatedBill.id,
      })

      if (j.mocked) {
        toast.info("Razorpay sandbox (mock) — simulating payment")
        await api.post("/payments/razorpay/verify", {
          billId: generatedBill.id,
          razorpayOrderId: j.orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: "mock",
        })
        toast.success("Razorpay (mock) payment captured")
        reset()
        return
      }

      const rz = new window.Razorpay({
        key: j.keyId,
        amount: j.amount,
        currency: "INR",
        name: "RMS",
        description: `Bill ${generatedBill.id.slice(-6)}`,
        order_id: j.orderId,
        handler: async (resp: Record<string, string>) => {
          try {
            await api.post("/payments/razorpay/verify", {
              billId: generatedBill.id,
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            })
            toast.success("Payment captured")
            reset()
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Verification failed")
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      })
      rz.open()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Razorpay failed")
    } finally {
      setProcessing(false)
    }
  }

  function reset() {
    setSelected(null)
    setGeneratedBill(null)
    setDiscount(0)
    setDiscountReason("")
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Payments</h1>
        <p className="text-sm text-muted-foreground">Counter</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-bold mb-3">Open orders to bill</h2>
            <div className="space-y-2">
              {orders.length === 0 && (
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground text-sm">
                  No open orders
                </div>
              )}
              {orders.map((o) => {
                const sub = o.items
                  .filter((i) => i.status !== "cancelled")
                  .reduce((s, i) => s + i.totalPrice, 0)
                const ready =
                  o.items.length > 0 &&
                  o.items
                    .filter((i) => i.status !== "cancelled")
                    .every((i) => i.status === "ready" || i.status === "served")
                return (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSelected(o)
                      setGeneratedBill(null)
                    }}
                    className={`w-full text-left card p-4 flex items-center justify-between hover:border-primary transition rounded-lg border ${
                      selected?.id === o.id
                        ? "border-primary border-2"
                        : "border-border"
                    }`}
                  >
                    <div>
                      <div className="text-lg font-bold">
                        Table {o.tableNumber || "—"}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        #{o.orderNumber} &middot; {o.items.length} items
                        {ready && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            ready
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-bold">{inr(sub)}</div>
                  </button>
                )
              })}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Recent paid bills</h2>
            <Card>
              {bills.map((b) => (
                <div
                  key={b.id}
                  className="px-4 py-3 flex items-center justify-between text-sm border-b last:border-b-0"
                >
                  <div>
                    <div className="font-mono font-semibold">
                      {b.paymentMethod}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Table {b.tableNumber ?? "—"} &middot; {b.paymentMethod}
                    </div>
                  </div>
                  <div className="font-bold">{inr(b.grandTotal)}</div>
                </div>
              ))}
              {bills.length === 0 && (
                <div className="px-4 py-3 text-muted-foreground text-sm">
                  No paid bills yet.
                </div>
              )}
            </Card>
          </section>
        </div>

        <div>
          <Card className="p-5 sticky top-4">
            {!selected && (
              <p className="text-muted-foreground text-sm">
                Pick an open order to start billing.
              </p>
            )}

            {selected && !generatedBill && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    draft bill
                  </p>
                  <h3 className="text-2xl font-bold">
                    Table {selected.tableNumber}
                  </h3>
                </div>

                <div className="space-y-1 max-h-[30vh] overflow-y-auto">
                  {selected.items
                    .filter((i) => i.status !== "cancelled")
                    .map((i, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm py-1"
                      >
                        <span className="truncate">
                          <span className="font-mono mr-2">&times;{i.quantity}</span>
                          {i.name}
                        </span>
                        <span className="font-mono">{inr(i.totalPrice)}</span>
                      </div>
                    ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">{inr(subtotal)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Discount ₹"
                      value={discount || ""}
                      onChange={(e) =>
                        setDiscount(Math.max(0, Number(e.target.value)))
                      }
                      className="text-sm"
                    />
                    <Input
                      placeholder="Reason"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>CGST 2.5%</span>
                    <span className="font-mono">{inr(cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST 2.5%</span>
                    <span className="font-mono">{inr(sgst)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-2xl pt-2">
                    <span>Total</span>
                    <span>{inr(total)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={processing}
                  onClick={generateBill}
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  Generate GST bill
                </Button>
              </div>
            )}

            {generatedBill && (
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  bill ready
                </div>
                <h3 className="text-2xl font-bold">
                  {inr(generatedBill.grandTotal)}
                </h3>
                <p className="font-mono text-xs text-muted-foreground">
                  {generatedBill.id.slice(-6)}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-1"
                    disabled={processing}
                    onClick={() => pay("cash")}
                  >
                    <Banknote className="h-5 w-5" />
                    <span className="text-xs">Cash</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-1"
                    disabled={processing}
                    onClick={() => pay("card")}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="text-xs">Card</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-1"
                    disabled={processing}
                    onClick={() => pay("upi")}
                  >
                    <QrCode className="h-5 w-5" />
                    <span className="text-xs">UPI</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex-col gap-1"
                    disabled={processing}
                    onClick={() => pay("netbanking")}
                  >
                    <ArrowLeftRight className="h-5 w-5" />
                    <span className="text-xs">Netbanking</span>
                  </Button>
                </div>
                <Button
                  className="w-full"
                  disabled={processing}
                  onClick={payRazorpay}
                >
                  Pay with Razorpay
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-xs"
                  onClick={() => setGeneratedBill(null)}
                >
                  &larr; Back to edit
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
