import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // this function is called only if the user is authenticated and has the required role (employee)
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // At this point, we are sure that we are on a protected route
        // because the 'matcher' below has already filtered the URLs.

        // Is there a token?
        if (!token) return false; // Redirect to login

        // Does the user have the "employee" role?
        const userRoles = token.roles || [];
        const isEmployee = userRoles.includes("employee");

        return isEmployee; // If false, redirect to login
      },
    },
  }
);

// CONFIGURAZIONE CHIAVE
export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/bookings/:path*",
    "/pricing/:path*",   
    "/resources/:path*", 
    // "/api/protected/:path*"
  ],
};