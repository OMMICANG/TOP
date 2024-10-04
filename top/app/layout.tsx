import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'THE OMMICANG PROJECT',
  description: 'BY OMMICANG | FOR HUMANITY',
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        {/* You can also add any other meta tags or styles here */}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}



// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body>{children}</body>
//     </html>
//   )
// }
