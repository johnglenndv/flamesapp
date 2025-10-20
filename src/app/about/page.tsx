import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find(p => p.id === 'about-us');

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 fade-in-page">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">About This Project</h1>
            <p className="mt-4 text-lg text-muted-foreground">Building modern, accessible web experiences.</p>
        </div>

        <Card className="shadow-lg">
          <div className="grid md:grid-cols-3">
             <div className="p-6 md:col-span-2">
                <CardHeader className="p-0">
                    <CardTitle>Our Mission</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                    <CardDescription>
                        Our mission is to build beautiful, accessible, and high-performance web applications that users love. This project serves as a template for creating such experiences using modern web technologies.
                    </CardDescription>
                    <p className="mt-4 mb-4">We believe in the power of good design and clean code. This app demonstrates a fundamental pattern in web development—routing and navigation—wrapped in a visually appealing package. The technology stack includes Next.js, TypeScript, and Tailwind CSS, utilizing Server Components for optimal performance.</p>
                    <p>The aesthetic is guided by a principle of "calm technology," using a soft color palette to create a welcoming digital space. We hope you find this demonstration both useful and inspiring for your own projects.</p>
                </CardContent>
             </div>
             {aboutImage && (
                <div className="p-6 bg-muted/50 flex items-center justify-center rounded-b-lg md:rounded-r-lg md:rounded-bl-none">
                    <Image
                        src={aboutImage.imageUrl}
                        alt={aboutImage.description}
                        width={250}
                        height={250}
                        className="rounded-full object-cover aspect-square shadow-md"
                        data-ai-hint={aboutImage.imageHint}
                    />
                </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
