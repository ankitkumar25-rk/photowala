import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api';
import ProductCard from '../components/ProductCard';
export default function Category() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['category', slug], queryFn: () => categoriesApi.getBySlug(slug).then(r => r.data.data) });
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2" style={{fontFamily:'Fraunces,serif'}}>{data?.name || slug}</h1>
      <p className="text-gray-500 mb-8">{data?.description}</p>
      {isLoading ? <div className="text-center py-12">Loading...</div> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {data?.products?.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
