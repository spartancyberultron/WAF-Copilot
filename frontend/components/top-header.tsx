"use client"

import * as React from "react"
import { User, Settings, LogOut, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TopHeader() {
  const router = useRouter()
  const { user, fetchUserProfile, logout } = useAuth()

  // Fetch user profile when component mounts
  React.useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [])

  const handleLogout = () => {
    // Call the logout function from useAuth (this handles clearing localStorage)
    logout()
    
    // Redirect to landing page
    router.push('/')
  }

  // Get display name (first_name + last_name, or username as fallback)
  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`
    } else if (user?.first_name) {
      return user.first_name
    } else if (user?.last_name) {
      return user.last_name
    }
    return user?.username || 'User'
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    } else if (user?.first_name) {
      return user.first_name[0].toUpperCase()
    } else if (user?.last_name) {
      return user.last_name[0].toUpperCase()
    }
    return user?.username?.[0]?.toUpperCase() || 'U'
  }

  return (
    <header className="border-b bg-stone-50 dark:bg-stone-900">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Logo and Product Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-800 border-2 border-stone-300">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              WAF Copilot
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Web Application Firewall Assistant
            </p>
          </div>
        </div>

        {/* Right side - Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full cursor-pointer"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatars/user.png" alt="User" />
                <AvatarFallback className="bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-200">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'No email'}
                </p>
                {user?.is_staff && (
                  <p className="text-xs leading-none text-amber-600 dark:text-amber-400">
                    Staff Member
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Commented out Profile and Settings options
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            */}
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
