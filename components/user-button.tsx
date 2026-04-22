'use client';

import { LogOut, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import GitHubIcon from '@/components/icons/github';

interface UserButtonProps {
	user:
		| {
				login: string;
				avatarUrl: string;
		  }
		| null;
	returnTo: string;
}

export default function UserButton({ user, returnTo }: UserButtonProps) {
	const encoded = encodeURIComponent(returnTo || '/');

	if (!user) {
		return (
			<Button asChild variant="outline" size="sm">
				<a
					href={`/api/auth/login?return_to=${encoded}`}
					className="text-foreground"
				>
					<GitHubIcon />
					Sign in
				</a>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-auto gap-2 px-1 py-1"
				>
					<Avatar size="sm">
						<AvatarImage src={user.avatarUrl} alt={user.login} />
						<AvatarFallback>
							{user.login.slice(0, 1).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className="text-sm">{user.login}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-0.5">
						<span className="text-sm font-medium">
							{user.login}
						</span>
						<span className="text-xs text-muted-foreground">
							Signed in via GitHub
						</span>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<a
						href={`https://github.com/${user.login}`}
						target="_blank"
						rel="noreferrer"
					>
						<User />
						View GitHub profile
					</a>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<a href={`/api/auth/logout?return_to=${encoded}`}>
						<LogOut />
						Sign out
					</a>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
