
import Image from 'next/image';

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <Image 
            src="/logo.png" 
            alt="F.L.A.M.E.S. Logo" 
            width={220} 
            height={220} 
            className="animate-beat" 
            priority
          />
        </div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Loading Dashboard</h1>
        <p className="text-muted-foreground">Please wait a moment while we prepare the map...</p>
      </div>
    </div>
  );
}
