/**
 * Lazily loads the Razorpay checkout script if it's not already loaded.
 * @returns {Promise<boolean>} Resolves to true when the script is loaded.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Razorpay SDK failed to load. Are you online?');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};
