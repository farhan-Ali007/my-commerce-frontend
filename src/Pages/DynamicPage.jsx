import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { getPageBySlug } from '../functions/pages';

const DynamicPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPageBySlug(slug);
        setPage(data);
      } catch (err) {
        setError('Page not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) return <div className="py-10 text-center">Loading...</div>;
  if (error) return <div className="py-10 text-center text-red-600">{error}</div>;
  if (!page) return null;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Helmet>
        <title>{page.title} | Etimad Mart</title>
        <meta name="description" content={page.metaDescription || ''} />
      </Helmet>
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
};

export default DynamicPage; 