const Image = require('../models/Image');

const getQRCode = async (req, res) => {
  try {
    const qrImage = await Image.findOne({}); // Assuming you have only one QR image stored
    if (!qrImage) {
      return res.status(404).json({ message: 'QR Code not found' });
    }
    res.contentType(qrImage.image.contentType);
    res.send(qrImage.image.data);
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({ message: 'Failed to fetch QR code' });
  }
};

module.exports = { getQRCode };
