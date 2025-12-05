import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
    function middleware() {
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // take the path name from the req
                const { pathname } = req.nextUrl;

                return true;
                // allow to signIn or signUp
                if (
                    pathname.startsWith("/api/auth") ||
                    pathname === "/login" ||
                    pathname === "/register"
                ) {
                    return true;
                }

                // allow for the public path
                if (pathname === "/" || pathname === "/api/videos") {
                    return true;
                }
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/home/:path*",
        "/profile/:path*",
        "/messages/:path*",
        "/search/:path*",
        "/more/:path*",
        "/((?!_next/static|_next/image|favicon.ico|public/).*)",
    ],
};

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot", "/api/auth"];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public routes and Next internals
    if (
        PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(p)) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/images") ||
        pathname.startsWith("/api/auth") // next-auth internals
    ) {
        return NextResponse.next();
    }

    // Check session token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.id) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("callbackUrl", req.nextUrl.pathname); // optional: return after login
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}
