import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'THE OMMICANG PROJECT',
  description: 'BY OMMICANG | FOR HUMANITY',
}

import Script from 'next/script';

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          // strategy="lazyOnload" // Ensures the script is loaded lazily, after the page content is loaded
          // onLoad={() => {
          //   // Any initialization logic for Telegram SDK
          //   window.Telegram?.WebApp?.ready();
          //   window.Telegram?.WebApp?.expand();
          // }}
        />
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
