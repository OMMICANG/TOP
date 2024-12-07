import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;

  // Retrieve KYC progress from cookies
  const kycProgress = req.cookies.get('kyc_progress')?.value;
  const circleUser = req.cookies.get('circleUser')?.value;


  // Redirect to preloader if starting elsewhere
  if (!kycProgress && pathname !== '/') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Validate navigation flow
  if (pathname.startsWith('/landingPage')) {
    if (!kycProgress) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/kyc/kycPhase1')) {
    if (!kycProgress) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/kyc/faceCapture')) {
    if (kycProgress !== 'kycPhase1-completed') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/kyc/kycPhase3')) {
    if (kycProgress !== 'faceCapture-completed') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/kyc/success')) {
    if (kycProgress !== 'kycPhase3-completed') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/login')) {
    if (!kycProgress) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/homePage')) {
    if (!kycProgress && !circleUser) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // if (pathname.startsWith('/kyc/faceCapture')) {
  //   if (kycProgress !== 'kycPhase1-completed') {
  //     url.pathname = '/';
  //     return NextResponse.redirect(url);
  //   }
  // }


  // Allow access to valid paths
  return NextResponse.next();
}

// Apply middleware to relevant routes
export const config = {
  matcher: [

    '/landingPage/:path*',
    '/kyc/kycPhase1/:path*',
    '/kyc/faceCapture/:path*',
    '/kyc/kycPhase3/:path*',
    '/kyc/success/:path*',
    '/login:path*',
    '/homePage:path*',

    

  ],
};
