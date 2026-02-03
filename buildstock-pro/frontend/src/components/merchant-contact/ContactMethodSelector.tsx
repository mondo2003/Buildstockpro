'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ContactMethod = 'email' | 'phone' | 'visit';

interface ContactMethodSelectorProps {
  value: ContactMethod;
  onChange: (method: ContactMethod) => void;
  className?: string;
}

const METHODS = {
  email: {
    label: 'Email',
    description: 'Receive a response via email',
    icon: Mail,
  },
  phone: {
    label: 'Phone',
    description: 'Get a call back from the merchant',
    icon: Phone,
  },
  visit: {
    label: 'Visit Branch',
    description: 'Visit the branch in person',
    icon: MapPin,
  },
};

export function ContactMethodSelector({
  value,
  onChange,
  className = '',
}: ContactMethodSelectorProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-3', className)}>
      {(Object.keys(METHODS) as ContactMethod[]).map((method) => {
        const { label, description, icon: Icon } = METHODS[method];
        const isSelected = value === method;

        return (
          <Card
            key={method}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isSelected
                ? 'ring-2 ring-primary bg-primary/5 border-primary/50'
                : 'hover:border-primary/50'
            )}
            onClick={() => onChange(method)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
