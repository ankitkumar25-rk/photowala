import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Download, Clock, CheckCircle, Truck, Package, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { serviceRequestsApi } from '../api';
import { useAuthStore } from '../store';

const STATUS_CONFIG = {
  NEW: { icon: AlertCircle, color: 'blue', label: 'New Request' },
  IN_PROGRESS: { icon: Clock, color: 'yellow', label: 'In Progress' },
  CONFIRMED: { icon: CheckCircle, color: 'green', label: 'Confirmed' },
  PROCESSING: { icon: Package, color: 'purple', label: 'Processing' },
  SHIPPED: { icon: Truck, color: 'indigo', label: 'Shipped' },
  DELIVERED: { icon: CheckCircle, color: 'green', label: 'Delivered' },
  CANCELLED: { icon: AlertCircle, color: 'red', label: 'Cancelled' },
  CLOSED: { icon: CheckCircle, color: 'gray', label: 'Closed' },
};

const colorClasses = {
  blue: 'text-blue-600 bg-blue-50',
  yellow: 'text-yellow-600 bg-yellow-50',
  green: 'text-green-600 bg-green-50',
  purple: 'text-purple-600 bg-purple-50',
  indigo: 'text-indigo-600 bg-indigo-50',
  red: 'text-red-600 bg-red-50',
  gray: 'text-gray-600 bg-gray-50',
};

export default function ServiceRequests() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-service-requests'],
    queryFn: () => serviceRequestsApi.myRequests().then((r) => r.data),
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Auto-refetch when window regains focus
  useEffect(() => {
    const handleFocus = () => qc.refetchQueries({ queryKey: ['my-service-requests'] });
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [qc]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your service requests</p>
          <a href="/login" className="text-brand-primary font-semibold hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Requests</h1>
        <p className="text-gray-600 mb-8">Track your laser cutting, marking, and CNC router requests</p>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">No service requests yet</p>
            <a
              href="/services"
              className="inline-block mt-4 bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
            >
              Create a Request
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.data?.map((request) => {
              const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.NEW;
              const Icon = statusConfig.icon;
              const colorClass = colorClasses[statusConfig.color];

              return (
                <div key={request.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Order Number</p>
                        <h3 className="text-xl font-bold text-brand-primary">{request.orderNumber}</h3>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{statusConfig.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-6 p-6 border-b border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Service Type</p>
                      <p className="text-sm font-semibold text-gray-900">{request.serviceType.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Quantity</p>
                      <p className="text-sm font-semibold text-gray-900">{request.quantity} pieces</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Dimensions (L×B×H)</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {request.sizeL} × {request.sizeB} × {request.sizeH}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Date Submitted</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(request.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Price Range</p>
                      <p className="text-sm font-semibold text-gray-900">{request.priceRange}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Timing</p>
                      <p className="text-sm font-semibold text-gray-900">{request.timingRange}</p>
                    </div>
                  </div>

                  {/* Tracking Info & Actions */}
                  <div className="p-6 space-y-4 bg-gray-50">
                    {request.trackingNumber && (
                      <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Tracking Number</p>
                          <p className="text-sm font-mono font-bold text-gray-900">{request.trackingNumber}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(request.trackingNumber);
                            toast.success('Copied to clipboard');
                          }}
                          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Copy
                        </button>
                      </div>
                    )}

                    {request.designFileUrl && (
                      <a
                        href={request.designFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between bg-white p-3 rounded border border-gray-200 hover:border-brand-primary transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-brand-primary" />
                          <span className="text-sm font-semibold text-gray-900">
                            {request.designFileUrl.includes('.pdf') ? 'View Design (PDF)' : 'Download Design File'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">↗</span>
                      </a>
                    )}

                    {request.notes && (
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{request.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
