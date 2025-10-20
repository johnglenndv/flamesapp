
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const features = [
  {
    title: 'Interactive Map',
    description: 'Pan and zoom through a detailed map interface.',
  },
  {
    title: 'Real-time Incident Reporting',
    description: 'View fire incident locations as they are reported.',
  },
  {
    title: 'Location Search',
    description: 'Quickly find and navigate to specific addresses or points of interest.',
  },
  {
    title: 'Light & Dark Modes',
    description: 'Switch between themes for optimal viewing comfort.',
  },
  {
    title: 'Responsive Design',
    description: 'A seamless experience across all your devices, from mobile to desktop.',
  },
    {
    title: 'Settings',
    description: 'Customize your experience with the settings menu.',
    },
];

export default function FeaturePage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 fade-in-page">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">Features</h1>
            <p className="mt-4 text-lg text-muted-foreground">Explore the powerful features of F.L.A.M.E.S.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
                <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <CheckCircle className="h-8 w-8 text-primary" />
                        <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
