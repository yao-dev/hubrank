'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProjectList() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/projects")
  }, []);

  return null
}
