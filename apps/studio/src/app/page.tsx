import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, FolderOpen, Package } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Topbar */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Vina.dev — Vibe Creation Studio
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome to Vina.dev
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Create amazing applications with AI-powered development tools
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Playground Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Playground</CardTitle>
              <CardDescription>
                Start coding with our interactive development environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/playground">
                <Button className="w-full">
                  Open Playground
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Projetos Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FolderOpen className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Projetos</CardTitle>
              <CardDescription>
                Manage and organize your development projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/projects">
                <Button className="w-full" variant="outline">
                  View Projects
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Assets Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Assets</CardTitle>
              <CardDescription>
                Browse and manage your project assets and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/assets">
                <Button className="w-full" variant="outline">
                  Browse Assets
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}