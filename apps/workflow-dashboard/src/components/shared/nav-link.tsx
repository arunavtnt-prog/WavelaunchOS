'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, FileText, Mail, Inbox, CheckCircle2, Settings, Code } from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: 'Queue', href: '/queue', icon: <Users className="h-4 w-4" /> },
  { title: 'Snapshots', href: '/snapshots', icon: <FileText className="h-4 w-4" /> },
  { title: 'Blueprints', href: '/blueprints', icon: <FileText className="h-4 w-4" /> },
  { title: 'Emails', href: '/emails', icon: <Mail className="h-4 w-4" /> },
  { title: 'Replies', href: '/replies', icon: <Inbox className="h-4 w-4" /> },
  { title: 'Conversions', href: '/conversions', icon: <CheckCircle2 className="h-4 w-4" /> },
  { title: 'Prompts', href: '/prompts', icon: <Code className="h-4 w-4" /> },
  { title: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
