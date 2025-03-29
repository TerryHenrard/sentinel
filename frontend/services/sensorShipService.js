import axios from 'axios';

const API_URL = 'http://localhost:5083/censorship';

export const censorContent = async (text) => {
    try {
        const response = await axios.post(`${API_URL}/censor`, {
            Text: text
        });
        return response.data;
    } catch (error) {
        console.error('Error censoring content:', error);
        throw error;
    }
};