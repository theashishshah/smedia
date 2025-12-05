export default function TermsAndPrivacyPage() {
    return (
        <main className="max-w-4xl mx-auto px-6 py-12 space-y-10 text-zinc-200">
            <h1 className="text-3xl font-semibold mb-6">Terms & Privacy Policy</h1>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    Welcome to {`Ashish Shah AI`}. By using this platform, you agree to our Terms of
                    Use and Privacy Policy. Please read these carefully before interacting with the
                    app.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-white">2. Usage Policy</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    You may use this application for personal or educational purposes. Do not use it
                    to create, share, or distribute harmful, offensive, or illegal content. We
                    reserve the right to restrict access for misuse.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-white">3. Data Collection</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    {`Ashish Shah AI`} does not permanently store your chat history or personal data
                    unless explicitly stated. Chats are stored locally on your device for your
                    convenience. You can clear this data anytime via the Settings page.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-white">4. Cookies and Analytics</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    Minimal analytics may be used to improve the experience (e.g., crash logs or
                    feature usage). No personal information or message content is ever shared with
                    third parties.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-white">5. Intellectual Property</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    The persona “Ashish Shah AI,” including its prompts, tone, and branding, is
                    protected intellectual property of its creator. You may not replicate or
                    commercialize this persona without permission.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-white">6. Liability</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    The developers are not responsible for how generated responses are used or
                    interpreted. Responses are AI-generated and may not always be accurate or
                    factual.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-white">7. Contact</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    For privacy or legal inquiries, please contact us at:
                    <br />
                    <span className="text-blue-400">ashishshah.ai@gmail.com</span>
                </p>
            </section>
        </main>
    );
}
