"use client";
import Script from "next/script";
import { useEffect } from "react";

const Emojicon = () => {
  useEffect(() => {
    const win = window as any;
    win.emojicom_widget = { campaign: "3QjtLZUPBLupYEsdZmz4" };
  }, []);

  return (
    <Script async src="https://cdn.emojicom.io/embed/widget.js" />
  )
}

export default Emojicon;