import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Camera, X } from "lucide-react"
import { useEffect } from "react"

import { Button } from "../../../components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form"
import { Input } from "../../../components/ui/input"

// Add this at the top of the file, after the imports
interface UploadtypeProps {
  onDataChange?: (data: any) => void
  docType?: string
}

const MAX_FILE_SIZE = 5000000 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const formSchema = z.object({
  frontSide: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Front side image is required")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "Max file size is 5MB")
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported",
    ),
  backSide: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Back side image is required")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "Max file size is 5MB")
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported",
    ),
})

// Update the component definition
const Uploadtype = ({ onDataChange, docType }: UploadtypeProps) => {
  const [frontPreview, setFrontPreview] = React.useState<string | null>(null)
  const [backPreview, setBackPreview] = React.useState<string | null>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [isCameraActive, setIsCameraActive] = React.useState(false)
  const [activeInput, setActiveInput] = React.useState<"front" | "back" | null>(null)
  const [files, setFiles] = React.useState<FileList | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  })

  // Watch for form changes and notify parent when valid
  const formValues = form.watch()
  const isValid = form.formState.isValid

  useEffect(() => {
    if (isValid && onDataChange) {
      onDataChange(formValues)
    }
  }, [formValues, isValid, onDataChange])

  // Add this to pass data back to the parent when files are uploaded
  useEffect(() => {
    if (files && files.length > 0 && onDataChange) {
      onDataChange({ files })
    }
  }, [files, onDataChange])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (onDataChange) {
      onDataChange(values)
    }
  }

  const startCamera = async (side: "front" | "back") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCameraActive(true)
      setActiveInput(side)
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
    setActiveInput(null)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0)

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${activeInput}-capture.jpg`, { type: "image/jpeg" })
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)

          if (activeInput === "front") {
            form.setValue("frontSide", dataTransfer.files)
            setFrontPreview(URL.createObjectURL(blob))
          } else if (activeInput === "back") {
            form.setValue("backSide", dataTransfer.files)
            setBackPreview(URL.createObjectURL(blob))
          }
        }
      }, "image/jpeg")

      stopCamera()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      if (side === "front") {
        setFrontPreview(url)
      } else {
        setBackPreview(url)
      }
      setFiles(e.target.files)
    }
  }

  const clearPreview = (side: "front" | "back") => {
    if (side === "front") {
      setFrontPreview(null)
      form.setValue("frontSide", new DataTransfer().files)
    } else {
      setBackPreview(null)
      form.setValue("backSide", new DataTransfer().files)
    }
  }

  React.useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview)
      if (backPreview) URL.revokeObjectURL(backPreview)
    }
  }, [frontPreview, backPreview])

  return (
    <div className="space-y-6">
      <div className="rounded-lg w-full">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">Document Verification</h2>
        <p className="text-muted-foreground mb-6">
          Upload your {docType || "identification document"} for verification.
        </p>

        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="frontSide"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Front Side</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              onChange(e.target.files)
                              handleFileChange(e, "front")
                            }}
                            className="bg-muted md:w-1/2"
                            {...field}
                          />
                          <Button
                            className="md:w-1/2"
                            type="button"
                            variant="outline"
                            onClick={() => startCamera("front")}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Take Photo
                          </Button>
                        </div>
                        {frontPreview && (
                          <div className="relative">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="top-2 right-2"
                              onClick={() => clearPreview("front")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <img
                              src={frontPreview || "/placeholder.svg"}
                              alt="Front side preview"
                              className="w-3/4 rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="backSide"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Back Side</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              onChange(e.target.files)
                              handleFileChange(e, "back")
                            }}
                            className="bg-muted md:w-1/2"
                            {...field}
                          />
                          <Button
                            className="md:w-1/2"
                            type="button"
                            variant="outline"
                            onClick={() => startCamera("back")}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Take Photo
                          </Button>
                        </div>
                        {backPreview && (
                          <div className="relative">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="top-2 right-2"
                              onClick={() => clearPreview("back")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <img
                              src={backPreview || "/placeholder.svg"}
                              alt="Back side preview"
                              className="max-w-sm rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isCameraActive && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
                <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 max-w-lg mx-auto p-6 bg-card rounded-lg shadow-lg">
                  <div className="space-y-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border" />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={stopCamera}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={capturePhoto}>
                        Capture
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <FormDescription>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p>Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Upload both sides of your document</li>
                  <li>Ensure the document is original and not expired</li>
                  <li>Place documents against a solid-colored background</li>
                </ul>
              </div>
            </FormDescription>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Uploadtype