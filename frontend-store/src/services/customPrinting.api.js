import api from '../api/client';
import { useMutation, useQuery } from '@tanstack/react-query';

/**
 * Create a new custom printing order
 * Handles both JSON and FormData (for file uploads)
 */
export const useCreateOrder = (servicePath) => {
    return useMutation({
        mutationFn: async (data) => {
            const isFormData = data instanceof FormData;
            const response = await api.post(`/v1/orders/custom-printing/${servicePath}`, data, {
                headers: {
                    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
                }
            });
            return response.data;
        }
    });
};

/**
 * Get order tracking details (public)
 */
export const useOrderTracking = (orderNumber) => {
    return useQuery({
        queryKey: ['order-tracking', orderNumber],
        queryFn: async () => {
            if (!orderNumber) return null;
            const response = await api.get(`/v1/orders/custom-printing/tracking/${orderNumber}`);
            return response.data;
        },
        enabled: !!orderNumber,
        refetchInterval: 30000 // Poll every 30s
    });
};

/**
 * Get current user's orders
 */
export const useMyOrders = (page = 1) => {
    return useQuery({
        queryKey: ['my-orders', page],
        queryFn: async () => {
            const response = await api.get('/v1/orders/custom-printing/my-orders', { params: { page } });
            return response.data;
        }
    });
};
