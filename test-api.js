
const testEndpoint = async () => {
    console.log('Testing Judge0 API endpoint...\n');

    const tests = [
        {
            name: 'Python Hello World',
            url: 'http://localhost:3000/api/v1/submissions/71/run',
            body: {
                source_code: 'print("Hello from Python!")',
                stdin: ''
            }
        },
        {
            name: 'JavaScript Hello World',
            url: 'http://localhost:3000/api/v1/submissions/63/run',
            body: {
                source_code: 'console.log("Hello from JavaScript!");',
                stdin: ''
            }
        },
        {
            name: 'C++ Hello World',
            url: 'http://localhost:3000/api/v1/submissions/54/run',
            body: {
                source_code: '#include <iostream>\nint main() { std::cout << "Hello from C++!" << std::endl; return 0; }',
                stdin: ''
            }
        }
    ];

    for (const test of tests) {
        console.log(`Testing: ${test.name}`);
        try {
            const response = await fetch(test.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(test.body)
            });

            const result = await response.json();

            if (result.stdout) {
                console.log(`✅ Success! Output: ${result.stdout.trim()}`);
            } else if (result.stderr) {
                console.log(`❌ Error: ${result.stderr}`);
            } else {
                console.log(`⚠️  Status: ${result.status?.description || 'Unknown'}`);
                console.log(`   Result:`, JSON.stringify(result, null, 2));
            }
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
        }
        console.log('');
    }
};

testEndpoint();
