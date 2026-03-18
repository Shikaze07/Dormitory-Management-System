import { v2 as cloudinary } from "cloudinary"
import { NextResponse } from "next/server"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "dormitory_users" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            resolve(NextResponse.json({ error: "Upload to Cloudinary failed" }, { status: 500 }))
          } else {
            resolve(NextResponse.json({ url: result?.secure_url }))
          }
        }
      ).end(buffer)
    })
  } catch (error) {
    console.error("Upload handler error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
