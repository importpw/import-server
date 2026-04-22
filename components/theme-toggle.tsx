'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ThemeToggle() {
	const { setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon-sm" aria-label="Toggle theme">
					<Sun className="dark:hidden" />
					<Moon className="hidden dark:block" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme('light')}>
					<Sun />
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					<Moon />
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')}>
					<Monitor />
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
