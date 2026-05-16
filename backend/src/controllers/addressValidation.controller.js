export const validateAddress = async (req, res, next) => {
  try {
    const { addressLine1, city, state, pincode } = req.body;

    if (!addressLine1 || !pincode) {
      return res.status(400).json({ 
        message: 'Address and pincode are required' 
      });
    }

    const response = await fetch(
      `https://addressvalidation.googleapis.com/v1:validateAddress?key=${
        process.env.GOOGLE_MAPS_API_KEY
      }`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            regionCode: 'IN',
            addressLines: [addressLine1, city, state, pincode],
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      // API error (disabled, quota, etc.) — don't block the user
      console.error('[Address Validation API Error]', data.error);
      return res.status(200).json({ 
        isValid: true, 
        hasIssues: false,
        apiUnavailable: true 
      });
    }

    const verdict = data.result?.verdict;
    const isValid = verdict?.addressComplete === true;
    const hasIssues = verdict?.hasUnconfirmedComponents === true;
    const correctedAddress =
      data.result?.address?.formattedAddress || null;

    return res.status(200).json({
      isValid,
      hasIssues,
      correctedAddress:
        correctedAddress !== addressLine1 ? correctedAddress : null,
    });

  } catch (err) {
    // Never block address saving due to validation API failure/exception
    console.error('[Address Validation Exception]', err.message);
    return res.status(200).json({ 
      isValid: true, 
      hasIssues: false,
      apiUnavailable: true
    });
  }
};
