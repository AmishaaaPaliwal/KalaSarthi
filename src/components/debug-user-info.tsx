'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Debug component to show current user information
 * Use this to verify authentication and user ID
 */
export function DebugUserInfo() {
    const { user, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <Card className="mb-4 border-yellow-300 bg-yellow-50">
                <CardContent className="pt-6">
                    <p>Loading user info...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-4 border-blue-300 bg-blue-50">
            <CardHeader>
                <CardTitle className="text-sm">🔍 Debug: User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs font-mono">
                <div>
                    <strong>Firebase User:</strong>
                    <div className="ml-4 mt-1">
                        {user ? (
                            <>
                                <div>✅ Logged in</div>
                                <div>UID: {user.uid}</div>
                                <div>Email: {user.email || 'N/A'}</div>
                            </>
                        ) : (
                            <div>❌ Not logged in</div>
                        )}
                    </div>
                </div>

                <div>
                    <strong>User Profile:</strong>
                    <div className="ml-4 mt-1">
                        {userProfile ? (
                            <>
                                <div>✅ Profile loaded</div>
                                <div>UID: {userProfile.uid}</div>
                                <div>Name: {userProfile.name}</div>
                                <div>Role: {userProfile.role}</div>
                            </>
                        ) : (
                            <div>❌ No profile</div>
                        )}
                    </div>
                </div>

                <div className="pt-2 border-t border-blue-300">
                    <strong>User ID being sent to API:</strong>
                    <div className="ml-4 mt-1 text-green-600 font-bold">
                        {user?.uid || userProfile?.uid || 'demo-user'}
                    </div>
                </div>

                <div className="pt-2 border-t border-blue-300 text-xs text-gray-600">
                    <strong>Note:</strong> Your Firestore products must have a 'userId' field
                    matching the ID above to be fetched correctly.
                </div>
            </CardContent>
        </Card>
    );
}
