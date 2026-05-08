import { Link } from 'react-router-dom';

const subCategories = [
  { title: 'Pen', to: '/services/custom-printing/pen', comingSoon: false },
  { title: 'Sticker labels', comingSoon: true },
  { title: 'Digital paper printing', comingSoon: true },
  { title: 'Letter head', comingSoon: true },
  { title: 'Garment tag', comingSoon: true },
  { title: 'Bill book', comingSoon: true },
  { title: 'Envelop', comingSoon: true },
];

export default function CustomPrintingIndex() {
  return (
    <div className="min-h-screen bg-cream-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs text-gray-500">Home → Our Services → Custom Printing</p>
        <h1 className="mt-3 text-3xl font-bold text-brand-primary">
          Custom Printing
        </h1>
        <p className="mt-2 text-gray-600">Choose a sub category to place custom printing orders.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subCategories.map((item) => (
            item.comingSoon ? (
              <div key={item.title} className="card p-4 opacity-70">
                <p className="font-semibold text-gray-800">{item.title}</p>
                <p className="mt-1 text-xs text-gray-500">Coming soon</p>
              </div>
            ) : (
              <Link key={item.title} to={item.to} className="card p-4 transition hover:shadow-lg">
                <p className="font-semibold text-gray-800">{item.title}</p>
                <p className="mt-1 text-xs text-brand-primary">Open</p>
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

