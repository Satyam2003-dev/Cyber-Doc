import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "Cyber-Doc — Read, Write, Publish";
  const description = "An organized editorial platform for drafting thoughtful stories, publishing beautifully, growing an audience, and understanding what readers value.";
  return {
    title,
    description,
    manifest: "/manifest.webmanifest",
    openGraph: { title, description, type: "website", images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "Cyber-Doc editorial publishing platform" }] },
    twitter: { card: "summary_large_image", title, description, images: [`${origin}/og.png`] },
  };
}

export const viewport: Viewport = { themeColor: "#176b4d", width: "device-width", initialScale: 1 };

const initialAppearance = `(function(){try{var d=document.documentElement;var p={theme:"auto",font:"system",motion:true};var saved=localStorage.getItem("cyber-blog-preferences-v1");if(saved)p=Object.assign(p,JSON.parse(saved));var h=new Date().getHours();var timed=h<5||h>=21?"dark":h<9?"spring":h<17?"light":h<19?"autumn":"rainforest";var allowed=["light","dark","spring","summer","autumn","winter","rainforest","ocean","desert","blossom","aurora"];var theme=p.theme==="auto"?timed:allowed.indexOf(p.theme)>-1?p.theme:timed;d.dataset.theme=theme;d.dataset.font=p.font==="serif"?"serif":"system";d.dataset.motion=p.motion===false?"off":"on";d.style.colorScheme=theme==="dark"||theme==="rainforest"||theme==="aurora"?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";document.documentElement.dataset.font="system";}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:initialAppearance}} /></head><body>{children}</body></html>;
}
