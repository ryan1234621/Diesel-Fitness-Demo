import { redirect } from "next/navigation";

export default function AdminIndex() {
  // Redirect /admin to the specific admin control center dashboard
  redirect("/admin/dashboard");
}
