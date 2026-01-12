import { redirect } from "next/navigation";

export default function AdminPage() {
  // This automatically moves the user to the login page 
  redirect("/admin/login");
}