import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { getPageBySlug } from '../functions/pages';
import getDynamicPageSchema from '../helpers/getDynamicPageSchema';

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

  // Generate schema
  const schema = getDynamicPageSchema({
    title: page.title,
    slug,
    description: page.metaDescription || page.content?.slice(0, 160),
    datePublished: page.datePublished,
    dateModified: page.dateModified,
    type: page.schemaType || "WebPage",
    language: "en"
  });

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Helmet>
        <title>{page.title} | Etimad Mart</title>
        <meta name="description" content={page.metaDescription || ''} />
        <link rel="canonical" href={window.location.href} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
};

export default DynamicPage; 