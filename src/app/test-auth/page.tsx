'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestAuthPage() {
    const { user, userProfile, loading } = useAuth();

    const testInventoryAPI = async () => {
        const userId = user?.uid || userProfile?.uid || 'demo-user';
        console.log('Testing with userId:', userId);

        try {
            const response = await fetch('/api/unified-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: 'show my inventory',
                    userId: userId
                })
            });

            const data = await response.json();
            console.log('API Response:', data);
            alert(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-8">
                <Card>
                    <CardContent className="pt-6">
                        <p>Loading authentication...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 space-y-4">
            <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>

            <Card className="border-2">
                <CardHeader>
                    <CardTitle>🔐 Authentication Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Firebase User:</h3>
                        {user ? (
                            <div className="bg-green-50 p-4 rounded space-y-1">
                                <p>✅ <strong>Logged In</strong></p>
                                <p><strong>UID:</strong> <code className="bg-white px-2 py-1 rounded">{user.uid}</code></p>
                                <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                                <p><strong>Display Name:</strong> {user.displayName || 'N/A'}</p>
                            </div>
                        ) : (
                            <div className="bg-red-50 p-4 rounded">
                                <p>❌ <strong>Not Logged In</strong></p>
                                <p className="text-sm mt-2">You need to log in to see your inventory data.</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-2">User Profile:</h3>
                        {userProfile ? (
                            <div className="bg-green-50 p-4 rounded space-y-1">
                                <p>✅ <strong>Profile Loaded</strong></p>
                                <p><strong>UID:</strong> <code className="bg-white px-2 py-1 rounded">{userProfile.uid}</code></p>
                                <p><strong>Name:</strong> {userProfile.name}</p>
                                <p><strong>Role:</strong> {userProfile.role}</p>
                                <p><strong>Phone:</strong> {userProfile.phone}</p>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 p-4 rounded">
                                <p>⚠️ <strong>No Profile</strong></p>
                                <p className="text-sm mt-2">Profile not loaded from database.</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-bold text-lg mb-2">User ID for API:</h3>
                        <div className="bg-blue-50 p-4 rounded">
                            <code className="text-lg font-bold text-blue-600">
                                {user?.uid || userProfile?.uid || 'demo-user'}
                            </code>
                            <p className="text-sm mt-2 text-gray-600">
                                This is the ID that will be sent to the API to fetch your data.
                            </p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <Button onClick={testInventoryAPI} className="w-full">
                            🧪 Test Inventory API
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                            Click to test if the API can fetch your inventory with this user ID.
                            Check browser console for results.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>📋 Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {!user && !userProfile && (
                        <div className="bg-red-50 p-4 rounded">
                            <p className="font-bold">❌ You're not logged in!</p>
                            <p className="text-sm mt-2">Please log in first:</p>
                            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                                <li>Go to the login page</li>
                                <li>Sign in with your credentials</li>
                                <li>Come back to this page</li>
                            </ul>
                        </div>
                    )}

                    {(user || userProfile) && (
                        <div className="bg-green-50 p-4 rounded space-y-2">
                            <p className="font-bold">✅ You're logged in!</p>
                            <p className="text-sm">Now check if your products have the correct userId:</p>
                            <ol className="list-decimal list-inside text-sm space-y-1 mt-2">
                                <li>Copy your User ID above: <code className="bg-white px-1">{user?.uid || userProfile?.uid}</code></li>
                                <li>Run: <code className="bg-white px-2 py-1">node scripts/fix-product-userid.js YOUR_USER_ID</code></li>
                                <li>Restart dev server</li>
                                <li>Test Artisan Buddy again</li>
                            </ol>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>🔧 Troubleshooting</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <p><strong>If you see "demo-user":</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>You're not logged in</li>
                            <li>Go to login page and sign in</li>
                            <li>Refresh this page</li>
                        </ul>

                        <p className="mt-4"><strong>If you see a real user ID but inventory is still 0:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Your products don't have the userId field</li>
                            <li>Run the fix script with your user ID</li>
                            <li>Check Firestore to verify</li>
                        </ul>

                        <p className="mt-4"><strong>Check browser console (F12) for:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>🔐 Auth Status logs</li>
                            <li>👤 User ID received logs</li>
                            <li>📦 Fetching inventory logs</li>
                            <li>Any error messages</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
