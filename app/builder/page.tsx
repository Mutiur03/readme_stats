"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { generateUnifiedCard } from "../../lib/svg/cards/unified";
import { getTheme } from "../../lib/svg/themes";

const THEMES = ["dark", "light", "glass", "neon", "github", "cyberpunk"];

export default function BuilderPage() {
    const [username, setUsername] = useState("Mutiur03");
    const [theme, setTheme] = useState("dark");
    const selectedCards = ["unified"];
    const [svgUrl, setSvgUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const generateUrl = () => {
        const params = new URLSearchParams({
            user: username,
            theme,
            cards: selectedCards.join(","),
            layout: "grid",
        });
        return `/api/generate?${params.toString()}`;
    };

    const getThemeObj = (t: string) => getTheme(t);

    const generateDemoSvgDataUrl = (t: string, user: string) => {
        const themeObj = getThemeObj(t);
        const demoStats = {
            user: {
                login: user,
                name: user,
                bio: "",
                avatar_url: "",
                followers: 0,
                following: 0,
                public_repos: 0,
                public_gists: 0,
                created_at: new Date().toISOString(),
            },
            totalStars: 128,
            totalForks: 12,
            totalCommits: 3421,
            totalPullRequests: 56,
            totalIssues: 8,
            createdRepositories: 10,
            contributedTo: 18,
            commitsToMyRepositories: 1200,
            commitsToAnotherRepositories: 2221,
            pullRequestsToAnotherRepositories: 34,
            contributedToOwnRepositories: 9,
            contributedToNotOwnerRepositories: 9,
            directStars: 80,
            indirectStars: 48,
            currentStreak: 5,
            longestStreak: 42,
            totalContributions: 4120,
            languages: { TypeScript: 12000, JavaScript: 8000 },
            topRepositories: [],
            lastFetch: new Date().toISOString(),
        };

        const svg = generateUnifiedCard(demoStats, themeObj, 450, 200);
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    };

    const generatePreview = async () => {
        if (username && selectedCards.length > 0) {
            setIsLoading(true);
            setSvgUrl(generateUrl());
        }
    };

    const showDemoForTheme = (t: string) => {
        const dataUrl = generateDemoSvgDataUrl(t, username || "demo-user");
        setIsLoading(false);
        setSvgUrl(dataUrl);
    };

    useEffect(() => {
        showDemoForTheme(theme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username, theme]);

    const imageSrc = svgUrl?.startsWith("data:") ? svgUrl : baseUrl ? `${baseUrl}${svgUrl}` : svgUrl;

    const markdownCode = `![GitHub Stats](${imageSrc})`;

    const htmlCode = `<img src="${imageSrc}" alt="GitHub Stats" />`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="tebg-linear-to-brtext-white mb-2">
                        README Stats Generator
                    </h1>
                    <p className="text-slate-400">
                        Create beautiful GitHub profile stats cards
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <Card className="glass-dark border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-slate-200">
                                        GitHub Username
                                    </Label>
                                    <Input
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter GitHub username"
                                        className="bg-slate-800 border-slate-600 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-200">Theme</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {THEMES.map((t) => (
                                            <Button
                                                key={t}
                                                disabled={isLoading}
                                                onClick={() => {
                                                    setTheme(t);
                                                    showDemoForTheme(t);
                                                }}
                                                variant={theme === t ? "default" : "outline"}
                                                className="capitalize"
                                            >
                                                {t}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={generatePreview}
                                    disabled={!username}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    size="lg"
                                >
                                    Generate Preview
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="glass-dark border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Embed Code</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-slate-200">Markdown</Label>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(markdownCode)}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                    <pre className="bg-slate-900 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                                        {markdownCode}
                                    </pre>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-slate-200">HTML</Label>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => copyToClipboard(htmlCode)}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                    <pre className="bg-slate-900 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                                        {htmlCode}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:sticky lg:top-8 h-fit">
                        <Card className="glass-dark border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Live Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {svgUrl && username ? (
                                    <div className="bg-slate-900 p-6 rounded-lg overflow-auto relative">
                                        {isLoading && (
                                            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
                                                <div className="text-slate-400 animate-pulse">Generating preview...</div>
                                            </div>
                                        )}
                                        <Image
                                            src={imageSrc}
                                            alt="GitHub Stats Preview"
                                            width={800}
                                            height={400}
                                            className="w-full"
                                            onLoadingComplete={() => setIsLoading(false)}
                                            onError={() => setIsLoading(false)}
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-slate-900 p-12 rounded-lg text-center text-slate-400">
                                        Configure your settings and click &quot;Generate Preview&quot;
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

