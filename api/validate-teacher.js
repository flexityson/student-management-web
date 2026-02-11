/**
 * Vercel Serverless Function to validate teacher access code
 * Compares the provided access code with the environment variable
 */

export default function handler(req, res) {
  // Set CORS headers for production
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'https://student-management-v1.vercel.app'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { accessCode } = req.body;

    // Validate that access code was provided
    if (!accessCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Access code is required' 
      });
    }

    // Get the expected access code from environment variable
    const expectedAccessCode = process.env.TEACHER_ACCESS_CODE;

    // Check if environment variable is set
    if (!expectedAccessCode) {
      console.error('TEACHER_ACCESS_CODE environment variable is not set');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
    }

    // Compare the provided access code with the expected one
    if (accessCode === expectedAccessCode) {
      return res.status(200).json({ 
        success: true, 
        message: 'Success' 
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        message: 'Fail' 
      });
    }

  } catch (error) {
    console.error('Error validating teacher access code:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
