import { ArtisanBuddySalesIntegration } from '@/components/artisan-buddy-sales-integration';

export default function TestSalesIntegrationPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">
                    Sales Data Integration Test
                </h1>
                <p className="text-gray-600 mb-8">
                    Test the real-time sales data fetching system for Artisan Buddy
                </p>

                <ArtisanBuddySalesIntegration />
            </div>
        </div>
    );
}
