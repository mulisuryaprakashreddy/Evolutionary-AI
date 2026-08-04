import { useSearch } from '@/lib/hooks';
import VideoCard from '@/components/VideoCard';

interface SearchPageProps {
  query: string;
}

export default function SearchPage({ query }: SearchPageProps) {
  const { results, loading } = useSearch(query);

  return (
    <div className="animate-fade-in">
      <h2 className="mb-4 text-sm text-brand-subtle">
        {loading ? 'Searching...' : `${results.length} results for "${query}"`}
      </h2>
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="aspect-video w-60 shrink-0 rounded-xl shimmer-bg" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 w-full rounded shimmer-bg" />
                <div className="h-3 w-1/2 rounded shimmer-bg" />
                <div className="h-3 w-1/3 rounded shimmer-bg" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
          <p className="text-lg text-white">No results found</p>
          <p className="text-sm text-brand-subtle">Try different keywords or remove search filters.</p>
        </div>
      ) : (
        <div className="max-w-4xl space-y-4">
          {results.map((video) => (
            <VideoCard key={video.id} video={video} variant="list" />
          ))}
        </div>
      )}
    </div>
  );
}
