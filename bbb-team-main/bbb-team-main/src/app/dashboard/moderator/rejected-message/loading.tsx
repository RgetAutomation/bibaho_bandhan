import Loader from "@/components/loader";
import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <Loader />
    </div>
  );
}
