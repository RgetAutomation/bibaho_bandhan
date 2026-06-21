import { redirect } from "next/navigation";
import React from "react";

export default function UserPage() {
  redirect("/users/home");
  return <div></div>;
}
