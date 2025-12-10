import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const publicRoutes = ["/", "/login"]; // rotas abertas
  const currentPath = request.nextUrl.pathname;

  const isPublic = publicRoutes.includes(currentPath);

  // Se tentar acessar rota protegida sem token → login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se tentar acessar login já estando logado → home
  if (token && currentPath === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
