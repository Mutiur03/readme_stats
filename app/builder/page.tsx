"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const THEMES = ["dark", "light", "glass", "neon", "github", "cyberpunk"];
const LAYOUTS = ["grid", "row", "column"];

export default function BuilderPage() {
    const [username, setUsername] = useState("Mutiur03");
    const [theme, setTheme] = useState("dark");
    const [selectedCards, setSelectedCards] = useState([
        "unified",
    ]);
    const [layout, setLayout] = useState<"grid" | "row" | "column">("grid");
    const [svgUrl, setSvgUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [baseUrl, setBaseUrl] = useState("");

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const generateUrl = () => {
        const params = new URLSearchParams({
            user: username,
            theme,
            cards: selectedCards.join(","),
            layout,
        });
        return `/api/generate?${params.toString()}`;
    };

    const generatePreview = () => {
        if (username && selectedCards.length > 0) {
            setIsLoading(true);
            setSvgUrl(generateUrl());
        }
    };

    const markdownCode = baseUrl
        ? `![GitHub Stats](${baseUrl}${svgUrl})`
        : `![GitHub Stats](${svgUrl})`;

    const htmlCode = baseUrl
        ? `<img src="${baseUrl}${svgUrl}" alt="GitHub Stats" />`
        : `<img src="${svgUrl}" alt="GitHub Stats" />`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        README Stats Generator
                    </h1>
                    <p className="text-slate-400">
                        Create beautiful GitHub profile stats cards
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Panel - Controls */}
                    <div className="space-y-6">
                        <Card className="glass-dark border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Username */}
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

                                {/* Theme */}
                                <div className="space-y-2">
                                    <Label className="text-slate-200">Theme</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {THEMES.map((t) => (
                                            <Button
                                                key={t}
                                                variant={theme === t ? "default" : "outline"}
                                                onClick={() => setTheme(t)}
                                                className="capitalize"
                                            >
                                                {t}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Layout */}
                                <div className="space-y-2">
                                    <Label className="text-slate-200">Layout</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {LAYOUTS.map((l) => (
                                            <Button
                                                key={l}
                                                variant={layout === l ? "default" : "outline"}
                                                onClick={() => setLayout(l as any)}
                                                className="capitalize"
                                            >
                                                {l}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Generate Button */}
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

                        {/* Code Output */}
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

                    {/* Right Panel - Preview */}
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
                                        <img
                                            src={svgUrl}
                                            alt="GitHub Stats Preview"
                                            className="w-full"
                                            onLoad={() => setIsLoading(false)}
                                            onError={() => setIsLoading(false)}
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-slate-900 p-12 rounded-lg text-center text-slate-400">
                                        Configure your settings and click "Generate Preview"
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

