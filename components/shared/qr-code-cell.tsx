"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"

interface QRCodeCellProps {
  value: string
  size?: number
  className?: string
}

export const QRCodeCell = ({ value, size = 40, className }: QRCodeCellProps) => {
  const [src, setSrc] = useState<string>("")

  useEffect(() => {
    QRCode.toDataURL(value, { width: size * 4 }).then(setSrc)
  }, [value, size])

  return src ? (
    <img 
      src={src} 
      alt="QR Code" 
      className={`border rounded ${className}`} 
      style={{ width: size, height: size }} 
    />
  ) : (
    <div 
      className={`animate-pulse bg-muted rounded ${className}`} 
      style={{ width: size, height: size }} 
    />
  )
}
