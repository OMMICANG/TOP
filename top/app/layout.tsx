export const metadata = {
  title: 'THE OMMICANG PROJECT',
  description: 'BY OMMICANG | FOR HUMANITY',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
