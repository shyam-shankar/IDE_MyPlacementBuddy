require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
    initApp();
});

function initApp() {
    const languageConfig = {
        python: { monacoId: 'python', judge0Id: 71, name: 'Python 3', icon: '' },
        javascript: { monacoId: 'javascript', judge0Id: 63, name: 'JavaScript', icon: '' },
        java: { monacoId: 'java', judge0Id: 62, name: 'Java', icon: '' },
        cpp: { monacoId: 'cpp', judge0Id: 54, name: 'C++', icon: '' },
        c: { monacoId: 'c', judge0Id: 50, name: 'C', icon: '' }
    };

    let currentLanguage = 'python';
    let editor = null;
    const API_BASE = 'http://localhost:3000/api';

    editor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
        value: getTemplate('python'),
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 }
    });

    const languageSelector = document.getElementById('language-selector');
    const languageBtn = document.getElementById('language-btn');
    const languageDropdown = document.getElementById('language-dropdown');
    const langNameEl = document.getElementById('lang-name');
    const runBtn = document.getElementById('run-btn');
    const submitBtn = document.getElementById('submit-btn');
    const outputPanel = document.getElementById('output-panel');
    const outputContent = document.getElementById('output-content');
    const closeOutput = document.getElementById('close-output');
    const timerDisplay = document.getElementById('timer-display');
    const resizeHandle = document.getElementById('resize-handle');

    const testCases = {
        visible: [
            { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1], description: "Basic case" },
            { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2], description: "Middle elements" },
            { input: { nums: [3, 3], target: 6 }, expected: [0, 1], description: "Duplicate numbers" }
        ],
        hidden: [
            { input: { nums: [1, 5, 8, 3, 9], target: 12 }, expected: [2, 3], description: "Hidden 1" },
            { input: { nums: [-1, -2, -3, -4, -5], target: -8 }, expected: [2, 4], description: "Negative numbers" },
            { input: { nums: [0, 4, 3, 0], target: 0 }, expected: [0, 3], description: "Zero target" },
            { input: { nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], target: 19 }, expected: [8, 9], description: "Large array" }
        ]
    };

    function getTemplate(lang) {
        const templates = {
            python: `def twoSum(nums, target):
    # Write your solution here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
            javascript: `function twoSum(nums, target) {
    // Write your solution here
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}`,
            java: `import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[] {seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
            cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
            c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your solution here
    int* result = (int*)malloc(2 * sizeof(int));
    *returnSize = 2;
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    *returnSize = 0;
    return NULL;
}`
        };
        return templates[lang] || '';
    }

    function getTestRunner(lang, testCase, userCode) {
        const { nums, target } = testCase.input;
        const numsStr = JSON.stringify(nums);

        switch (lang) {
            case 'python':
                return `
${userCode}

import json
try:
    nums = ${numsStr}
    target = ${target}
    result = twoSum(nums, target)
    print(json.dumps(sorted(result)))
except Exception as e:
    print(e)
`;
            case 'javascript':
                return `
${userCode}

try {
    const nums = ${numsStr};
    const target = ${target};
    const result = twoSum(nums, target);
    console.log(JSON.stringify(result.sort((a,b) => a-b)));
} catch (e) {
    console.log(e.message);
}
`;
            case 'java':
                return `
${userCode}

public class Main {
    public static void main(String[] args) {
        try {
            Solution sol = new Solution();
            int[] nums = {${nums.join(', ')}};
            int target = ${target};
            int[] result = sol.twoSum(nums, target);
            java.util.Arrays.sort(result);
            System.out.println("[" + result[0] + ", " + result[1] + "]");
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}
`;
            case 'cpp':
                return `
${userCode}

int main() {
    try {
        Solution sol;
        vector<int> nums = {${nums.join(', ')}};
        int target = ${target};
        vector<int> result = sol.twoSum(nums, target);
        sort(result.begin(), result.end());
        cout << "[" << result[0] << ", " << result[1] << "]" << endl;
    } catch (const exception& e) {
        cout << e.what() << endl;
    }
    return 0;
}
`;
            case 'c':
                return `
${userCode}

int main() {
    int nums[] = {${nums.join(', ')}};
    int numsSize = ${nums.length};
    int target = ${target};
    int returnSize;
    int* result = twoSum(nums, numsSize, target, &returnSize);
    if (result != NULL && returnSize == 2) {
        int a = result[0], b = result[1];
        if (a > b) { int t = a; a = b; b = t; }
        printf("[%d, %d]\\n", a, b);
        free(result);
    } else {
        printf("[]\\n");
    }
    return 0;
}
`;
            default:
                return userCode;
        }
    }

    async function executeTestCase(lang, testCase) {
        const userCode = editor.getValue();
        const completeCode = getTestRunner(lang, testCase, userCode);
        const languageId = languageConfig[lang].judge0Id;

        try {
            const response = await fetch(`${API_BASE}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source_code: completeCode,
                    language_id: languageId,
                    stdin: ""
                })
            });

            const result = await response.json();

            if (result.status && result.status.id !== 3) {
                return {
                    success: false,
                    output: null,
                    error: result.stderr || result.compile_output || result.message || result.status.description
                };
            }

            const output = (result.stdout || '').trim();

            try {
                const parsedOutput = JSON.parse(output);
                const expectedSorted = [...testCase.expected].sort((a, b) => a - b);
                const actualSorted = [...parsedOutput].sort((a, b) => a - b);
                const testPassed = JSON.stringify(expectedSorted) === JSON.stringify(actualSorted);

                return {
                    success: true,
                    passed: testPassed,
                    output: parsedOutput,
                    expected: testCase.expected
                };
            } catch (e) {
                return {
                    success: true,
                    passed: false,
                    output,
                    expected: testCase.expected,
                    parseError: true
                };
            }

        } catch (error) {
            return {
                success: false,
                error: 'Network/API Error: ' + error.message
            };
        }
    }

    async function runTests(includeHidden = false) {
        if (!languageConfig[currentLanguage]) return;

        outputPanel.classList.add('visible');
        editor.layout();

        const testCasesToRun = includeHidden
            ? [...testCases.visible, ...testCases.hidden]
            : testCases.visible;

        outputContent.innerHTML = `
            <div class="test-results">
                <div class="test-header">${includeHidden ? '🚀 Submitting Solution...' : '▶️ Running Test Cases...'}</div>
            </div>`;

        let passedCount = 0;
        let resultsHTML = '';

        for (let i = 0; i < testCasesToRun.length; i++) {
            const testCase = testCasesToRun[i];
            const isHidden = i >= testCases.visible.length;
            const testLabel = isHidden
                ? `Hidden ${i - testCases.visible.length + 1}`
                : `Test ${i + 1}`;

            outputContent.innerHTML = `
                <div class="test-results">
                    <div class="test-header">${includeHidden ? '🚀 Submitting Solution...' : '▶️ Running Test Cases...'}</div>
                    ${resultsHTML}
                    <div class="test-case running">⏳ Running ${testLabel}...</div>
                </div>`;

            const result = await executeTestCase(currentLanguage, testCase);

            let testHTML;

            if (!result.success) {
                testHTML = `<div class="test-case failed">
                    <span class="test-icon">❌</span>
                    <span class="test-name">${testLabel}</span>
                    <span class="test-status">Error</span>
                    <div class="test-detail error">${escapeHtml(result.error)}</div>
                </div>`;
            } else if (result.passed) {
                passedCount++;
                if (isHidden) {
                    testHTML = `<div class="test-case passed">
                        <span class="test-icon">✅</span>
                        <span class="test-name">${testLabel}</span>
                        <span class="test-status">Passed</span>
                    </div>`;
                } else {
                    testHTML = `<div class="test-case passed">
                        <span class="test-icon">✅</span>
                        <span class="test-name">${testLabel}</span>
                        <span class="test-status">Passed</span>
                        <div class="test-detail">
                            <div>Input: nums = ${JSON.stringify(testCase.input.nums)}, target = ${testCase.input.target}</div>
                            <div>Output: ${JSON.stringify(result.output)}</div>
                        </div>
                    </div>`;
                }
            } else {
                if (isHidden) {
                    testHTML = `<div class="test-case failed">
                        <span class="test-icon">❌</span>
                        <span class="test-name">${testLabel}</span>
                        <span class="test-status">Failed</span>
                    </div>`;
                } else {
                    testHTML = `<div class="test-case failed">
                        <span class="test-icon">❌</span>
                        <span class="test-name">${testLabel}</span>
                        <span class="test-status">Failed</span>
                        <div class="test-detail">
                            <div>Input: nums = ${JSON.stringify(testCase.input.nums)}, target = ${testCase.input.target}</div>
                            <div>Expected: ${JSON.stringify(testCase.expected)}</div>
                            <div>Got: ${JSON.stringify(result.output)}</div>
                        </div>
                    </div>`;
                }
            }

            resultsHTML += testHTML;
        }

        const totalTests = testCasesToRun.length;
        const allPassed = passedCount === totalTests;

        let summaryHTML = `<div class="test-summary ${allPassed ? 'all-passed' : 'some-failed'}">
            ${allPassed ? '🎉' : '📊'} ${passedCount}/${totalTests} test cases passed
        </div>`;

        if (includeHidden && allPassed) {
            summaryHTML += `<div class="accepted-banner">✅ Accepted! All test cases passed.</div>`;
        }

        outputContent.innerHTML = `<div class="test-results">
            <div class="test-header">${includeHidden ? '🚀 Submitting Solution...' : '▶️ Running Test Cases...'}</div>
            ${summaryHTML}
            ${resultsHTML}
        </div>`;
    }

    function changeLanguage(lang) {
        if (!editor) return;

        currentLanguage = lang;
        const config = languageConfig[lang];

        monaco.editor.setModelLanguage(editor.getModel(), config.monacoId);
        editor.setValue(getTemplate(lang));

        langNameEl.textContent = config.name;
        languageBtn.querySelector('.lang-icon').textContent = config.icon;

        languageDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.classList.toggle('active', item.dataset.value === lang);
        });

        const fileTab = document.querySelector('.file-tab.active');
        const extensions = { python: 'py', javascript: 'js', java: 'java', cpp: 'cpp', c: 'c' };
        fileTab.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16,18 22,12 16,6"></polyline><polyline points="8,6 2,12 8,18"></polyline></svg>solution.${extensions[lang] || 'txt'}`;

        languageSelector.classList.remove('open');
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    languageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        languageSelector.classList.toggle('open');
    });

    languageDropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            changeLanguage(item.dataset.value);
        });
    });

    document.addEventListener('click', () => languageSelector.classList.remove('open'));

    runBtn.addEventListener('click', () => runTests(false));
    submitBtn.addEventListener('click', () => runTests(true));

    closeOutput.addEventListener('click', () => {
        outputPanel.classList.remove('visible');
        setTimeout(() => editor.layout(), 300);
    });

    let isResizing = false;
    let startY = 0;
    let startHeight = 0;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startY = e.clientY;
        startHeight = outputPanel.offsetHeight;
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const deltaY = startY - e.clientY;
        const newHeight = Math.min(
            Math.max(startHeight + deltaY, 80),
            window.innerHeight * 0.7
        );

        outputPanel.style.height = newHeight + 'px';
        editor.layout();
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });

    window.addEventListener('resize', () => {
        if (editor) editor.layout();
    });

    let totalSeconds = 3 * 60;

    setInterval(() => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (totalSeconds > 0) {
            totalSeconds--;
        }
    }, 1000);
}
