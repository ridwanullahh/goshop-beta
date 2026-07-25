
import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HelpArticle() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/help">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Help Center
            </Button>
          </Link>
          
          <article className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold mb-8">Getting Started Guide</h1>
            
            <div className="space-y-6">
              <p>
                Welcome to our platform! This comprehensive guide will help you get started and make the most 
                of your experience. Follow these steps to set up your account and begin exploring.
              </p>
              
              <h2 className="text-2xl font-bold">Step 1: Create Your Account</h2>
              
              <p>
                To get started, you'll need to create an account. Click the "Sign Up" button in the top right 
                corner of any page and fill out the registration form with your details.
              </p>
              
              <h2 className="text-2xl font-bold">Step 2: Complete Your Profile</h2>
              
              <p>
                Once your account is created, take a few minutes to complete your profile. Add a profile picture, 
                update your contact information, and set your preferences.
              </p>
              
              <h2 className="text-2xl font-bold">Step 3: Explore the Platform</h2>
              
              <p>
                Now you're ready to explore! Browse our product categories, discover new stores, 
                and start building your wishlist.
              </p>
            </div>
            
            <div className="border-t pt-8 mt-8">
              <h3 className="text-lg font-semibold mb-4">Was this article helpful?</h3>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Yes
                </Button>
                <Button variant="outline" size="sm">
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  No
                </Button>
              </div>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
