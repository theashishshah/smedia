export default function SettingsPage() {
    return (
        <main className="max-w-3xl mx-auto px-6 py-12 space-y-8 text-zinc-200">
            <h1 className="text-3xl font-semibold mb-4">Settings</h1>
            <p className="text-zinc-400 mb-8">
                Customize your experience with {`Ashish Shah AI`}. Manage your preferences, privacy,
                and chat behavior here.
            </p>

            <section className="space-y-4 border border-zinc-800 rounded-2xl p-6 bg-zinc-950">
                <h2 className="text-xl font-semibold text-white">Profile</h2>
                <div className="space-y-3">
                    <p className="text-sm text-zinc-400">
                        Update your name, email, or profile picture.
                    </p>
                    <button className="bg-blue-600 px-4 py-2 rounded-md text-white text-sm">
                        Edit Profile
                    </button>
                </div>
            </section>

            <section className="space-y-4 border border-zinc-800 rounded-2xl p-6 bg-zinc-950">
                <h2 className="text-xl font-semibold text-white">Chat Settings</h2>
                <div className="space-y-3 text-sm text-zinc-400">
                    <p>• Save chat history locally</p>
                    <p>• Show typing animation</p>
                    <p>• Enable/disable personality mode</p>
                </div>
                <button className="mt-3 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md text-white text-sm">
                    Clear Chat History
                </button>
            </section>

            <section className="space-y-4 border border-zinc-800 rounded-2xl p-6 bg-zinc-950">
                <h2 className="text-xl font-semibold text-white">Privacy & Security</h2>
                <p className="text-sm text-zinc-400">
                    We don’t store your messages on servers unless you explicitly enable cloud sync.
                    Your local storage data can be deleted anytime.
                </p>
                <button className="mt-3 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white text-sm">
                    Delete My Data
                </button>
            </section>
        </main>
    );
}
