import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";

export const metadata = {
  title: "Voter Management System",
  description: "Voter Management Application built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        // Removed Geist font variables after removing Geist fonts themselves.
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
