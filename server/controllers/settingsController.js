const User = require('../models/User');

// Update user's language preference
exports.updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    
    // Validate language
    const supportedLanguages = ['en', 'hi', 'ta', 'kn', 'te'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({ 
        message: 'Invalid language. Supported languages are: en, hi, ta, kn, te' 
      });
    }
    
    // Update user's language preference
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { language },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'Language preference updated successfully',
      user 
    });
  } catch (error) {
    console.error('Error updating language preference:', error);
    res.status(500).json({ message: 'Server error' });
  }
};