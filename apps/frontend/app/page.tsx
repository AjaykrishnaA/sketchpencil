import React from 'react';
import Link from 'next/link'
import { Pencil, Users, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Pencil className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Sketchpencil</span>
          </div>
          <div className="space-x-4">
            <Link href="/signin">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                Sign in
              </button>
            </Link>
            <Link href="/signup">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Sign up
            </button>
            </Link>

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Bring Your Ideas to Life with Sketchpencil
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The ultimate digital canvas for artists, designers, and creative minds.
            Create, collaborate, and share your artwork with the world.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <button className="px-8 py-3 bg-white text-gray-900 rounded-md hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 grid md:grid-cols-3 gap-12">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Pencil className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Powerful Drawing Tools
            </h3>
            <p className="text-gray-600">
              Professional-grade brushes, pens, and tools that respond naturally to
              your touch and pressure.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Real-time Collaboration
            </h3>
            <p className="text-gray-600">
              Work together with your team in real-time, share feedback, and create
              amazing artwork together.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              AI-Powered Effects
            </h3>
            <p className="text-gray-600">
              Enhance your artwork with intelligent filters and effects powered by
              cutting-edge AI technology.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-32 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Pencil className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Sketchpencil</span>
            </div>
            <p className="text-gray-600">
              © 2025 Sketchpencil. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}