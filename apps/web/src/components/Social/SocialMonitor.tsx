import { Bookmark, ExternalLink, Flag } from "lucide-react";
import React from "react";

export const SocialMonitor: React.FC = () => {
  const [relevantTweets, setRelevantTweets] = React.useState<
    Array<{
      keyword: string;
      text: string;
      inserted_at?: string;
      relevant?: boolean;
    }>
  >([]);
  const [keywordInput, setKeywordInput] = React.useState<string>("");
  const [appliedKeywords, setAppliedKeywords] = React.useState<string[]>([]);
  const [flaggedPosts, setFlaggedPosts] = React.useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = React.useState<Set<string>>(new Set());

  const fetchRelevantTweets = React.useCallback(async (keywords: string[]) => {
    const base = `http://localhost:3000/api/tweets/relevant`;
    const params = new URLSearchParams();
    if (keywords.length) {
      params.set("keywords", keywords.join(","));
    }
    params.set("limit", "50");
    const url = `${base}?${params.toString()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const data = (await res.json()) as Array<{
        keyword: string;
        text: string;
        inserted_at?: string;
        relevant?: boolean;
      }>;
      if (!Array.isArray(data)) return;

      let list = data;
      if (list.length === 0) {
        const params2 = new URLSearchParams(params);
        params2.set("recompute", "1");
        try {
          const res2 = await fetch(`${base}?${params2.toString()}`);
          if (res2.ok) {
            const data2 = (await res2.json()) as typeof data;
            if (Array.isArray(data2)) list = data2;
          }
        } catch {}
      }

      const sorted = [...list].sort((a, b) => {
        const ta = a.inserted_at ? Date.parse(a.inserted_at) : 0;
        const tb = b.inserted_at ? Date.parse(b.inserted_at) : 0;
        return tb - ta;
      });
      setRelevantTweets(sorted.slice(0, 50));
    } catch {}
  }, []);

  React.useEffect(() => {
    fetchRelevantTweets(appliedKeywords);
  }, [appliedKeywords, fetchRelevantTweets]);

  const formatTimeAgo = (iso?: string) => {
    if (!iso) return "";
    const ts = Date.parse(iso);
    if (Number.isNaN(ts)) return "";
    const diff = Date.now() - ts;
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    return `${d}d ago`;
  };

  const handleViewSource = (tweet: { keyword: string; text: string }) => {
    // For demo purposes, we'll show a placeholder URL
    // In a real app, this would be the actual tweet/post URL
    const sourceUrl = `https://twitter.com/search?q=${encodeURIComponent(
      tweet.text.substring(0, 50)
    )}`;
    window.open(sourceUrl, "_blank", "noopener,noreferrer");
  };

  const handleToggleFlag = (tweetId: string) => {
    setFlaggedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tweetId)) {
        newSet.delete(tweetId);
      } else {
        newSet.add(tweetId);
      }
      return newSet;
    });
  };

  const handleToggleSave = (tweetId: string) => {
    setSavedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tweetId)) {
        newSet.delete(tweetId);
      } else {
        newSet.add(tweetId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-neutral-900 mb-3">Keyword Filters</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Enter keywords (comma-separated) e.g., cyclone, flood, earthquake"
            className="flex-1 border border-neutral-300 bg-white rounded-md px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex gap-2">
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              onClick={() => {
                const kws = keywordInput
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean);
                setAppliedKeywords(kws);
              }}
            >
              Apply Filters
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 transition-colors"
              onClick={() => {
                setKeywordInput("");
                setAppliedKeywords([]);
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        {appliedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-neutral-200">
            <span className="text-xs text-neutral-600 mr-2">Active filters:</span>
            {appliedKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200"
              >
                #{kw}
                <button
                  onClick={() => setAppliedKeywords((prev) => prev.filter((k) => k !== kw))}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tweets Container */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        {relevantTweets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-neutral-600">No relevant tweets found.</p>
            <p className="text-xs text-neutral-500 mt-1">
              Try adjusting your keyword filters or check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {relevantTweets.map((t, idx) => (
              <div
                key={`${t.keyword}-${idx}`}
                className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
              >
                <div className="w-full">
                  {/* Header with keyword and timestamp */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                        #{t.keyword}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatTimeAgo(t.inserted_at)}
                      </span>
                    </div>
                    <button className="p-1 text-neutral-400 hover:text-blue-600 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Tweet content */}
                  <p className="text-sm text-neutral-800 leading-relaxed break-words">{t.text}</p>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100">
                    <button
                      onClick={() => handleViewSource(t)}
                      className="flex items-center gap-1 text-xs text-neutral-500 hover:text-blue-600 transition-colors"
                      title="View original source"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Source</span>
                    </button>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggleFlag(`${t.keyword}-${idx}`)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          flaggedPosts.has(`${t.keyword}-${idx}`)
                            ? "text-red-600 hover:text-red-700"
                            : "text-neutral-500 hover:text-red-600"
                        }`}
                        title={
                          flaggedPosts.has(`${t.keyword}-${idx}`)
                            ? "Remove from LLM context"
                            : "Exclude from LLM context"
                        }
                      >
                        <Flag
                          className={`h-3 w-3 ${
                            flaggedPosts.has(`${t.keyword}-${idx}`) ? "fill-current" : ""
                          }`}
                        />
                        <span>Flag</span>
                      </button>
                      <button
                        onClick={() => handleToggleSave(`${t.keyword}-${idx}`)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          savedPosts.has(`${t.keyword}-${idx}`)
                            ? "text-blue-600 hover:text-blue-700"
                            : "text-neutral-500 hover:text-blue-600"
                        }`}
                        title={
                          savedPosts.has(`${t.keyword}-${idx}`)
                            ? "Remove bookmark"
                            : "Bookmark for reference"
                        }
                      >
                        <Bookmark
                          className={`h-3 w-3 ${
                            savedPosts.has(`${t.keyword}-${idx}`) ? "fill-current" : ""
                          }`}
                        />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMonitor;
