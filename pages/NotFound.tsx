import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { txt } from '@/lib/text';
import { cn } from '@/lib/utils';

const NotFound: React.FC = () => (
  <div className="flex flex-1 min-h-[50vh] flex-col items-center justify-center px-4 text-center">
    <p className="text-6xl font-bold text-primary/20 select-none" aria-hidden>
      404
    </p>
    <h1 className="mt-2 text-xl font-semibold text-foreground">{txt('notFound.title')}</h1>
    <p className="mt-2 max-w-md text-sm text-muted-foreground">{txt('notFound.message')}</p>
    <Link
      to="/"
      className={cn(
        'mt-6 inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-medium',
        'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
      )}
    >
      <Home size={16} />
      {txt('notFound.backHome')}
    </Link>
  </div>
);

export default NotFound;
