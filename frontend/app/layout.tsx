import type { Metadata } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import { GoogleAuthProvider } from "@/providers/GoogleAuthProvider";
import "./globals.css";

export const metadata: Metadata = {
    title: "Project Management Tool",
    description: "Manage your projects, teams, and tasks efficiently",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <QueryProvider>
                    <GoogleAuthProvider>
                        {children}
                    </GoogleAuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
