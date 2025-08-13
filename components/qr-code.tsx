"use client"

import * as React from "react"
import QR from "qrcode"

export function QRCode({
  text,
  size = 96,
  className,
  alt = "QR code",
}: {
  text: string
  size?: number
  className?: string
  alt?: string
}) {
  const [src, setSrc] = React.useState<string>("")

  React.useEffect(() => {
    let mounted = true
    async function gen() {
      try {
        const dataUrl = await QR.toDataURL(text || " ", {
          errorCorrectionLevel: "M",
          margin: 1,
          width: size,
          color: { dark: "#0ea5e9", light: "#ffffff" },
        })
        if (mounted) setSrc(dataUrl)
      } catch {
        // ignore
      }
    }
    gen()
    return () => {
      mounted = false
    }
  }, [text, size])

  if (!src) return <div style={{ width: size, height: size }} className="bg-slate-200" aria-hidden="true" />
  return <img src={src || "/placeholder.svg"} width={size} height={size} alt={alt} className={className} />
}
