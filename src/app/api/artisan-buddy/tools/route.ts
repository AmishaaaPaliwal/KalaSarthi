import { NextRequest, NextResponse } from 'next/server';
import { executeArtisanBuddyTool, artisanBuddyTools } from '@/lib/services/artisan-buddy-tools';

/**
 * API Route: Execute Artisan Buddy tools
 * POST /api/artisan-buddy/tools
 */
export async function POST(request: NextRequest) {
    try {
        const { toolName, parameters } = await request.json();

        if (!toolName) {
            return NextResponse.json(
                { success: false, error: 'Tool name is required' },
                { status: 400 }
            );
        }

        const result = await executeArtisanBuddyTool(toolName, parameters || {});

        return NextResponse.json({
            success: true,
            result,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error executing tool:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to execute tool',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

/**
 * GET: List available tools
 */
export async function GET() {
    const toolsList = artisanBuddyTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
    }));

    return NextResponse.json({
        success: true,
        tools: toolsList,
    });
}
