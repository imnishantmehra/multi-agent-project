import Link from 'next/link'
import { UserCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  username?: string
}

export function Header({ username }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-2xl font-bold">
          Logo
        </Link>
        <nav>
          <ul className="flex space-x-4">
            {['Menu Item 1', 'Menu Item 2', 'Menu Item 3', 'Menu Item 4'].map((item, index) => (
              <li key={index}>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2">
            <UserCircle className="h-5 w-5" />
            <span>{username ? username : 'Login'}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link href="/account-settings" className="w-full">
              My Account Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

