import Protected from "@/components/shared/Protected"
import KDS from "@/components/features/KDS"

export default function KDSPage() {
  return (
    <Protected roles={["chef", "manager", "owner", "waiter"]}>
      <KDS />
    </Protected>
  )
}
