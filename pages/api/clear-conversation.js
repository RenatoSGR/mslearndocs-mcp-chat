export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Since we're using client-side state management, we just return success
    // The actual clearing is handled on the frontend
    res.status(200).json({ 
      success: true, 
      message: 'Conversation cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
}
