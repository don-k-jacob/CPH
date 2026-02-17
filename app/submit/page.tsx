import { requireUser } from "@/lib/auth";
import { LaunchSidebar } from "@/components/submit/launch-sidebar";
import { LaunchWizard } from "@/components/submit/launch-wizard";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  await requireUser();
  return (
    <section className="space-y-8">
      <div>
        <span className="ornament">Ship What Serves</span>
        <h1 className="section-heading mt-2 text-4xl font-bold">
          Launch your product
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-black/70">
          Tell us more about your launch. We’ll need its name, tagline, links, launch tags, and description. It will appear in Today once published.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="card p-4 sm:p-6 md:p-8">
          <LaunchWizard />
        </div>
        <div className="lg:pt-0">
          <LaunchSidebar />
        </div>
      </div>
    </section>
  );
}
