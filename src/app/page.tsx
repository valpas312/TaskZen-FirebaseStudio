import { getSession } from '@auth0/nextjs-auth0';
import Image from 'next/image';

import { getTasks } from '@/app/actions';
import Header from '@/components/Header';
import { TaskList } from '@/components/TaskList';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default async function Home() {
  const session = await getSession();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-logged-out');

  if (!session?.user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center text-center max-w-xl">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                width={600}
                height={400}
                className="rounded-xl shadow-lg mb-12"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
              Focus, Organize, Achieve
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-md">
              Welcome to TaskZen, your personal space to conquer your daily
              goals with calm and clarity.
            </p>
            <Button asChild className="mt-8 text-lg py-6 px-8">
              <a href="/api/auth/login">Log In to Get Started</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { data: tasks, error } = await getTasks();

  console.log(session)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header user={session.user} />
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8">
        <TaskList initialTasks={tasks ?? []} apiError={error as string} />
      </main>
    </div>
  );
}
