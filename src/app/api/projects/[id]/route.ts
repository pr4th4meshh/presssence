import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/serverAuth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // params is now a Promise
) {
  try {
    // Await the params promise first
    const { id: projectId } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!projectId) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify the project exists and belongs to the user
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        Portfolio: {
          select: {
            User: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.Portfolio.User.id !== (session.user as any).id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Delete the project
    await prisma.project.delete({
      where: { id: projectId }
    });

    return NextResponse.json(
      { success: true, message: 'Project deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}