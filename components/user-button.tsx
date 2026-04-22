'use client';

import { useState } from 'react';

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
	const [open, setOpen] = useState(false);
	const encoded = encodeURIComponent(returnTo || '/');

	if (!user) {
		return (
			<a
				href={`/api/auth/login?return_to=${encoded}`}
				className="rounded-md border border-[#eaeaea] px-3 py-1 text-xs font-medium text-black hover:bg-[#fafafa]"
			>
				Sign in with GitHub
			</a>
		);
	}

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="flex items-center gap-1.5 rounded-full border border-[#eaeaea] p-0.5 pr-2 text-xs text-black hover:bg-[#fafafa]"
				aria-haspopup="menu"
				aria-expanded={open}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={user.avatarUrl}
					alt=""
					className="h-5 w-5 rounded-full"
				/>
				<span>{user.login}</span>
			</button>
			{open && (
				<div
					role="menu"
					className="absolute right-0 mt-1.5 min-w-[140px] rounded-md border border-[#eaeaea] bg-white py-1 text-xs shadow-md"
				>
					<a
						href={`https://github.com/${user.login}`}
						className="block px-3 py-1.5 text-black hover:bg-[#fafafa]"
						role="menuitem"
					>
						View profile
					</a>
					<a
						href={`/api/auth/logout?return_to=${encoded}`}
						className="block px-3 py-1.5 text-black hover:bg-[#fafafa]"
						role="menuitem"
					>
						Sign out
					</a>
				</div>
			)}
		</div>
	);
}
