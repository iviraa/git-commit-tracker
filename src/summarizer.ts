import axios from 'axios';

async function getSummary(diff: string, apiKey: string): Promise<string> {

    const OPENAI_API_KEY = apiKey;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: `Summarize the following code changes:\n\n${diff}` }
                ],
                max_tokens: 200,
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.data && response.data.choices && response.data.choices[0].message) {
            return response.data.choices[0].message.content.trim();
        } else {
            console.error('Unexpected response structure:', response.data);
            return 'Error summarizing code changes.';
        }
    } catch (error) {
        console.error('Error contacting OpenAI API:', error);
        return 'Error summarizing code changes.';
    }
}

export default getSummary;
