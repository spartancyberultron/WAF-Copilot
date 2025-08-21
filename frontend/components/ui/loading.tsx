import { Loader2 } from "lucide-react"

interface LoadingProps {
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Loading({ message = "Loading...", size = "md", className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = "md", className = "" }: Omit<LoadingProps, "message">) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-primary ${className}`} />
  )
}
