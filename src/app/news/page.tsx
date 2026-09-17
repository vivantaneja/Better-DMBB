import { EmptyState, NewsCard, SectionTitle } from "@/components/site-shell";
import { getDmbbData } from "@/lib/data/dmbb";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 900;

export const metadata = {
  title: "News",
};

export default async function NewsPage() {
  const data = await getDmbbData();

  return (
    <section className="py-10">
      <div className="mbd-container space-y-6">
        <SectionTitle eyebrow="Around the league" title="News" />
        {data.news.length > 0 ? (
          <div className="space-y-4">
            {data.news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          /*
           * The previous build filled this page with placeholder category chips
           * and a fabricated headline. An honest empty state and a link to the
           * real source is better than invented content.
           */
          <EmptyState title="No news published here yet">
            <p>
              This site does not currently republish board announcements. For official notices,
              fixtures changes and competition rules, see{" "}
              <a
                href={siteConfig.governingBody.url}
                className="font-semibold underline underline-offset-2"
                rel="noopener noreferrer"
                target="_blank"
              >
                {siteConfig.governingBody.url.replace("https://", "")}
              </a>
              .
            </p>
          </EmptyState>
        )}
      </div>
    </section>
  );
}
