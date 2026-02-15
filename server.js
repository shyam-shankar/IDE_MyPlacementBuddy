require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://localhost:2358';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/execute', async (req, res) => {
    try {
        const { source_code, language_id, stdin } = req.body;

        if (!source_code || !language_id) {
            return res.status(400).json({
                error: 'Missing required fields: source_code and language_id'
            });
        }

        const headers = {
            'Content-Type': 'application/json'
        };

        if (JUDGE0_API_KEY) {
            headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
        }
        if (JUDGE0_HOST) {
            headers['X-RapidAPI-Host'] = JUDGE0_HOST;
        }

        const judge0Url = `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`;

        const judge0Response = await fetch(judge0Url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                source_code: source_code,
                language_id: language_id,
                stdin: stdin || ''
            })
        });

        // Log response details for debugging
        console.log('Judge0 Response Status:', judge0Response.status);
        console.log('Judge0 Response Headers:', Object.fromEntries(judge0Response.headers));

        // Get the raw response text first
        const responseText = await judge0Response.text();
        console.log('Judge0 Response Body:', responseText);

        // Check if response is empty
        if (!responseText) {
            throw new Error('Judge0 returned an empty response. Is Judge0 running at ' + JUDGE0_API_URL + '?');
        }

        // Try to parse the JSON
        let executionResult;
        try {
            executionResult = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error(`Failed to parse Judge0 response: ${parseError.message}. Response: ${responseText.substring(0, 200)}`);
        }

        res.json(executionResult);

    } catch (error) {
        console.error('Error executing code:', error);
        res.status(500).json({
            error: 'Failed to execute code',
            message: error.message
        });
    }
});

// Public Judge0 API endpoint: /api/v1/submissions/:language_id/run
app.post('/api/v1/submissions/:language_id/run', async (req, res) => {
    try {
        const { language_id } = req.params;
        const { source_code, stdin, expected_output, cpu_time_limit, memory_limit } = req.body;

        if (!source_code) {
            return res.status(400).json({
                error: 'Missing required field: source_code'
            });
        }

        const headers = {
            'Content-Type': 'application/json'
        };

        if (JUDGE0_API_KEY) {
            headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
        }
        if (JUDGE0_HOST) {
            headers['X-RapidAPI-Host'] = JUDGE0_HOST;
        }

        const judge0Url = `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`;

        // Build submission payload
        const submissionPayload = {
            source_code: source_code,
            language_id: parseInt(language_id),
            stdin: stdin || ''
        };

        // Add optional parameters if provided
        if (expected_output) submissionPayload.expected_output = expected_output;
        if (cpu_time_limit) submissionPayload.cpu_time_limit = cpu_time_limit;
        if (memory_limit) submissionPayload.memory_limit = memory_limit;

        const judge0Response = await fetch(judge0Url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(submissionPayload)
        });

        // Log response details for debugging
        console.log('Judge0 Response Status:', judge0Response.status);

        // Get the raw response text first
        const responseText = await judge0Response.text();

        // Check if response is empty
        if (!responseText) {
            throw new Error('Judge0 returned an empty response. Is Judge0 running at ' + JUDGE0_API_URL + '?');
        }

        // Try to parse the JSON
        let executionResult;
        try {
            executionResult = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error(`Failed to parse Judge0 response: ${parseError.message}. Response: ${responseText.substring(0, 200)}`);
        }

        res.json(executionResult);

    } catch (error) {
        console.error('Error executing code:', error);
        res.status(500).json({
            error: 'Failed to execute code',
            message: error.message
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Judge0 API URL: ${JUDGE0_API_URL}`);
});
