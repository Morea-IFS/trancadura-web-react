import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const currentPath = request.nextUrl.pathname;

  const publicRoutes = ["/", "/login"];
  const isPublic = publicRoutes.includes(currentPath);

  // 🔐 Rota protegida sem token
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🔁 Usuário logado tentando acessar login -> Vai direto para a Trancadura
  if (token && currentPath === "/login") {
    return NextResponse.redirect(new URL("/trancadura", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 🔓 Ignora assets estáticos e imagens
    "/((?!_next/static|_next/image|api|favicon.ico|images|assets).*)",
  ],
};
