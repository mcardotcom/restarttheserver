import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AnalysisResult {
  headline: string;
  summary: string;
  hype_score: number;
  category: string;
}

export async function analyzeTranscript(
  transcript: string,
  title: string
): Promise<AnalysisResult | null> {
  try {
    // Truncate transcript to avoid token limits
    const truncatedTranscript = transcript.split(' ').slice(0, 4000).join(' ');

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that analyzes YouTube video transcripts. Create a concise, engaging summary in exactly 2 sentences. The first sentence should pose a question or state a problem. The second should deliver the key value proposition or solution, starting with "From" or "Through". Also provide a flame score (1-5) and category.`
        },
        {
          role: "user",
          content: `Title: ${title}\n\nTranscript: ${truncatedTranscript}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Parse the response
    const [summary, metadata] = content.split('\n\n');
    const [flameScore, category] = metadata.split('|').map(s => s.trim());

    return {
      headline: title,
      summary: summary.trim(),
      hype_score: parseInt(flameScore) || 1,
      category: category || 'Other'
    };
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    return null;
  }
} 