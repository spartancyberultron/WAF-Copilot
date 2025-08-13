"use client"

import * as React from "react"
import { User, Settings, LogOut, Shield } from "lucide-react"

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
  return (
    <header className="border-b bg-stone-50 dark:bg-stone-900">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Logo and Product Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-700 border-2 border-stone-300">
            <Shield className="h-5 w-5 text-stone-200" />
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
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@wafcopilot.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
