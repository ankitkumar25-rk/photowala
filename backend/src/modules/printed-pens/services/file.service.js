const { uploadAutoToCloudinary } = require('../../../config/cloudinary');

exports.uploadOrderFile = async (orderId, fileBuffer, originalName) => {
  const options = {
    folder: `printed-pen-orders/order-${orderId}`,
    use_filename: true,
    filename_override: originalName
  };

  const result = await uploadAutoToCloudinary(fileBuffer, options);
  
  return {
    fileUrl: result.secure_url,
    filePublicId: result.public_id,
    fileType: result.format || result.resource_type,
    fileSize: result.bytes
  };
};
