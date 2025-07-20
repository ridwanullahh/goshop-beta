import React, { useState, useEffect } from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Notification } from '@/lib/commerce-sdk';

export default function Notifications() {
  const { sdk, currentUser } = useCommerce();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      if (!sdk || !currentUser) return;
      const userNotifications = await sdk.getNotifications(currentUser.id);
      setNotifications(userNotifications);
    }
    loadNotifications();
  }, [sdk, currentUser]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <DropdownMenuItem key={notification.id}>
              <div className="flex flex-col">
                <span className="font-semibold">{notification.title}</span>
                <span className="text-sm text-muted-foreground">{notification.message}</span>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem>
            <span className="text-muted-foreground">No new notifications</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}