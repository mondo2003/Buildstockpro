'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ShoppingCart, MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Quick Actions Dashboard Widget
 * Shows quick action buttons for creating quotes, bulk orders, and viewing contact requests
 */

export interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const actions = [
    {
      title: 'Create New Quote',
      description: 'Build a custom quote for your project',
      icon: FileText,
      href: '/quotes/new',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Start Bulk Order',
      description: 'Order materials in bulk from multiple suppliers',
      icon: ShoppingCart,
      href: '/bulk-orders',
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'My Contact Requests',
      description: 'View and manage your merchant contacts',
      icon: MessageSquare,
      href: '/contact-requests',
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 hover:bg-accent/5 hover:border-accent/30 transition-all group"
            >
              <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// Compact variant (for smaller dashboard spaces)
export interface QuickActionsCompactProps {
  className?: string;
}

export function QuickActionsCompact({ className }: QuickActionsCompactProps) {
  const actions = [
    {
      title: 'New Quote',
      icon: FileText,
      href: '/quotes/new',
      color: 'hover:bg-blue-100 hover:text-blue-600',
    },
    {
      title: 'Bulk Order',
      icon: ShoppingCart,
      href: '/bulk-orders',
      color: 'hover:bg-green-100 hover:text-green-600',
    },
    {
      title: 'Contact',
      icon: MessageSquare,
      href: '/contact-requests',
      color: 'hover:bg-purple-100 hover:text-purple-600',
    },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 h-9 px-3 ${action.color} transition-colors`}
            >
              <action.icon className="w-4 h-4" />
              <span className="text-sm">{action.title}</span>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// Horizontal variant (for top of dashboard)
export interface QuickActionsHorizontalProps {
  className?: string;
}

export function QuickActionsHorizontal({ className }: QuickActionsHorizontalProps) {
  const actions = [
    {
      title: 'New Quote',
      description: 'Create a quote',
      icon: FileText,
      href: '/quotes/new',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Bulk Order',
      description: 'Order in bulk',
      icon: ShoppingCart,
      href: '/bulk-orders',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Contact',
      description: 'Contact merchants',
      icon: MessageSquare,
      href: '/contact-requests',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-md`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default QuickActions;
