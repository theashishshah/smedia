export default function DevelopersPage() {
    return (
        <main className="max-w-4xl mx-auto px-6 py-12 space-y-10 text-zinc-200">
            <h1 className="text-3xl font-semibold mb-4">Developers</h1>
            <p className="text-zinc-400">
                {`Ashish Shah AI`} is an open, extensible chat interface built using modern web
                technologies. Developers can contribute, extend personas, and integrate the system
                with their own LLM backends.
            </p>

            <section className="space-y-4 border border-zinc-800 rounded-2xl p-6 bg-zinc-950">
                <h2 className="text-xl font-semibold text-white">Tech Stack</h2>
                <ul className="list-disc list-inside text-zinc-400 text-sm space-y-1">
                    <li>Next.js 14 (App Router)</li>
                    <li>TypeScript + React 19</li>
                    <li>Framer Motion for animations</li>
                    <li>Tailwind CSS + shadcn/ui for styling</li>
                    <li>OpenAI SDK for LLM communication</li>
                    <li>Serverless APIs (Edge-ready)</li>
                </ul>
            </section>

            <section className="space-y-4 border border-zinc-800 rounded-2xl p-6 bg-zinc-950">
                <h2 className="text-xl font-semibold text-white">Contribute</h2>
                <p className="text-sm text-zinc-400">
                    We welcome contributions from the community. Whether it’s improving prompts,
                    fixing UI inconsistencies, or adding new personality modes — everything helps!
                </p>
                <a
                    href="https://github.com/ashishshah-ai"
                    className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white text-sm"
                >
                    Visit GitHub
                </a>
            </section>

            <section className="space-y-4 border border-zinc-800 rounded-2xl p-6 bg-zinc-950">
                <h2 className="text-xl font-semibold text-white">API Access</h2>
                <p className="text-sm text-zinc-400">
                    If you want to integrate your own model endpoint, you can replace the API route
                    in
                    <code className="bg-zinc-800 px-1 py-0.5 rounded ml-1">/api/message</code>.
                </p>
                <p className="text-sm text-zinc-400">
                    Use the same payload structure:
                    <code className="bg-zinc-800 px-1 py-0.5 rounded ml-1">
                        {"{ messages: [ { role, content } ] }"}
                    </code>
                </p>
            </section>
        </main>
    );
}
