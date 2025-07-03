
import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function BlogSingle() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          
          <article className="prose prose-lg max-w-none">
            <Badge variant="secondary" className="mb-4">Technology</Badge>
            <h1 className="text-4xl font-bold mb-4">The Future of E-commerce</h1>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                John Doe
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Dec 15, 2024
              </div>
            </div>

            <img 
              src="/placeholder.svg" 
              alt="Blog post featured image" 
              className="w-full aspect-video object-cover rounded-lg mb-8"
            />

            <div className="space-y-6">
              <p>
                The e-commerce landscape is evolving rapidly, driven by technological advances and changing consumer expectations. 
                In this comprehensive guide, we'll explore the key trends that are shaping the future of online retail.
              </p>
              
              <h2 className="text-2xl font-bold">Key Trends in E-commerce</h2>
              
              <p>
                From artificial intelligence to augmented reality, new technologies are revolutionizing how consumers 
                discover, evaluate, and purchase products online. Here's what retailers need to know.
              </p>
              
              <h3 className="text-xl font-semibold">1. AI-Powered Personalization</h3>
              
              <p>
                Artificial intelligence is enabling unprecedented levels of personalization in e-commerce. 
                Machine learning algorithms can analyze customer behavior, preferences, and purchase history 
                to deliver tailored product recommendations and experiences.
              </p>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
