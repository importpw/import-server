import { NextRequest, NextResponse } from "next/server";
import { parsePath } from './lib/parse-path';
//import parseCommittish from './lib/parse-committish';

export const config = {
    //matcher: '/!{api/**,_next/**}'
}

export default function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/_next')) {
        return NextResponse.next();
    }

    if (pathname === '/favicon.ico') {
        return NextResponse.next();
    }

    const parsed = parsePath(req.nextUrl);
    //parseCommittish(parsed);
    console.log(parsed);

    const url = req.nextUrl.clone();
    url.pathname = '/404';
    return NextResponse.rewrite(url);
}